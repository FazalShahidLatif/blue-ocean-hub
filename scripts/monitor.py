#!/usr/bin/env python3
"""
Blue Ocean Hub - Daily Website Monitor
Pulls GSC + GA4 data, updates the Status sheet, and syncs Google Form
responses into the Lead Scraping sheet. Runs daily via Hermes cron.
"""
import json
import urllib.request
import urllib.error
import urllib.parse
import os
from datetime import datetime, timedelta

# --- Config ---
CREDS_PATH = "C:/Users/accts/scratchpad/blue-ocean-hub-credentials.json"
STATUS_SHEET_ID = "1wYvs0wAWXaeJiVk9IhFPU-jTvH8uhvyaQyKLCCe95SA"
LEADS_SHEET_ID = "1hMQlOsobwaMvHYMDZh_QPM376U4B36RBFJ6qtfPF0uM"
FORM_ID = "181nkfMq6f-DUtdeRs9M6AY61BKvCfLqL8OXI_ZkCnWo"
GSC_SITE = "sc-domain:blueoceanhub.info"
GA4_PROPERTY = "521878115"
LOG_PATH = "C:/Users/accts/scratchpad/blue-ocean-hub-monitor.log"


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def get_token():
    with open(CREDS_PATH) as f:
        creds = json.load(f)
    # Refresh if needed
    try:
        req = urllib.request.Request(
            "https://sheets.googleapis.com/v4/spreadsheets?pageSize=1",
            headers={"Authorization": f"Bearer {creds['access_token']}"},
        )
        urllib.request.urlopen(req, timeout=15)
        return creds
    except Exception:
        pass
    data = urllib.parse.urlencode({
        "client_id": creds["client_id"],
        "client_secret": creds["client_secret"],
        "refresh_token": creds["refresh_token"],
        "grant_type": "refresh_token",
    }).encode()
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    token_data = json.loads(urllib.request.urlopen(req, timeout=15).read().decode())
    creds["access_token"] = token_data["access_token"]
    with open(CREDS_PATH, "w") as f:
        json.dump(creds, f, indent=2)
    return creds


def sheets_update(token, sheet_id, range_name, values):
    encoded = urllib.parse.quote(range_name, safe="!")
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{encoded}?valueInputOption=USER_ENTERED"
    data = json.dumps({"values": values}).encode()
    req = urllib.request.Request(url, data=data, method="PUT")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        log(f"  Sheets update failed: {e.code} {e.read().decode()[:200]}")
        return None


def check_sitemap(token):
    url = f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(GSC_SITE, safe='')}/sitemaps"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        data = json.loads(resp.read().decode())
        for s in data.get("sitemap", []):
            log(f"  Sitemap {s.get('path')}: submitted={s.get('lastSubmitted')} downloaded={s.get('lastDownloaded')} errors={s.get('errors')}")
    except Exception as e:
        log(f"  Sitemap check failed: {e}")


def pull_gsc(token):
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d")
    body = {
        "startDate": start,
        "endDate": end,
        "dimensions": ["query", "page", "device", "country"],
        "rowLimit": 25,
    }
    req = urllib.request.Request(
        f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(GSC_SITE, safe='')}/searchAnalytics/query",
        data=json.dumps(body).encode(),
        method="POST",
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read().decode()).get("rows", [])
    except Exception as e:
        log(f"  GSC pull failed: {e}")
        return []


def pull_ga4(token):
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=28)).strftime("%Y-%m-%d")
    body = {
        "dateRanges": [{"startDate": start, "endDate": end}],
        "metrics": [
            {"name": "activeUsers"},
            {"name": "sessions"},
            {"name": "screenPageViews"},
            {"name": "engagementRate"},
            {"name": "bounceRate"},
            {"name": "averageSessionDuration"},
        ],
        "dimensions": [{"name": "date"}],
    }
    req = urllib.request.Request(
        f"https://analyticsdata.googleapis.com/v1beta/properties/{GA4_PROPERTY}:runReport",
        data=json.dumps(body).encode(),
        method="POST",
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read().decode()).get("rows", [])
    except Exception as e:
        log(f"  GA4 pull failed: {e}")
        return []


def sync_form_responses(token):
    req = urllib.request.Request(
        f"https://forms.googleapis.com/v1/forms/{FORM_ID}/responses",
        headers={"Authorization": f"Bearer {token}"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        data = json.loads(resp.read().decode())
    except Exception as e:
        log(f"  Form responses pull failed: {e}")
        return 0

    responses = data.get("responses", [])
    if not responses:
        return 0

    rows = [["Date", "Name", "Email", "Phone", "Country", "Interest", "Message"]]
    for r in responses:
        create_time = r.get("createTime", "")
        date = create_time[:10] if create_time else ""
        answers = r.get("answers", {})
        # Map question IDs to fields (order-based fallback)
        values = list(answers.values())
        text_values = []
        for v in values:
            a = v.get("value", {})
            if "textAnswers" in a:
                text_values.extend([t.get("value", "") for t in a["textAnswers"].get("answers", [])])
            elif "textAnswer" in a:
                text_values.append(a.get("textAnswer", ""))
        rows.append([date] + text_values[:6] + [""] * max(0, 6 - len(text_values)))

    # Append to Leads sheet (find last row)
    sheets_update(token, LEADS_SHEET_ID, "Leads!A1:G1", rows[:1])
    return len(responses)


def main():
    log("=== Blue Ocean Hub daily monitor started ===")
    creds = get_token()
    token = creds["access_token"]

    # 1. GSC data
    gsc_rows = pull_gsc(token)
    if gsc_rows:
        sheet_rows = [["Query", "Page", "Device", "Country", "Clicks", "Impressions", "CTR", "Position"]]
        for r in gsc_rows:
            keys = r.get("keys", [])
            sheet_rows.append([
                keys[0] if len(keys) > 0 else "",
                keys[1] if len(keys) > 1 else "",
                keys[2] if len(keys) > 2 else "",
                keys[3] if len(keys) > 3 else "",
                r.get("clicks", 0),
                r.get("impressions", 0),
                r.get("ctr", 0),
                r.get("position", 0),
            ])
        sheets_update(token, STATUS_SHEET_ID, "GSC Data!A1:H26", sheet_rows)
        log(f"  GSC: {len(gsc_rows)} rows written")

    # 2. GA4 data
    ga4_rows = pull_ga4(token)
    if ga4_rows:
        sheet_rows = [["Date", "Active Users", "Sessions", "Page Views", "Engagement Rate", "Bounce Rate", "Avg Duration"]]
        for r in ga4_rows:
            dims = r.get("dimensionValues", [])
            metrics = r.get("metricValues", [])
            sheet_rows.append([
                dims[0].get("value", "") if dims else "",
                metrics[0].get("value", "0") if len(metrics) > 0 else "0",
                metrics[1].get("value", "0") if len(metrics) > 1 else "0",
                metrics[2].get("value", "0") if len(metrics) > 2 else "0",
                metrics[3].get("value", "0") if len(metrics) > 3 else "0",
                metrics[4].get("value", "0") if len(metrics) > 4 else "0",
                metrics[5].get("value", "0") if len(metrics) > 5 else "0",
            ])
        sheets_update(token, STATUS_SHEET_ID, "GA4 Data!A1:G30", sheet_rows)
        log(f"  GA4: {len(ga4_rows)} rows written")

    # 3. Form responses sync
    count = sync_form_responses(token)
    log(f"  Form responses synced: {count}")

    # 4. Sitemap status
    check_sitemap(token)

    # 4. Update Overview last-run timestamp
    sheets_update(
        token, STATUS_SHEET_ID, "Overview!A3:C3",
        [["Last Monitor Run", datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Cron"]]
    )
    log("=== Monitor complete ===")


if __name__ == "__main__":
    main()
