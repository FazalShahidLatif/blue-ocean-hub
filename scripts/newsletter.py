#!/usr/bin/env python3
"""
Blue Ocean Hub - Newsletter Sender
Reads subscribers from the Lead Scraping sheet and sends a weekly newsletter
via the Gmail API. Tracks sent status in the Newsletter Subscribers tab.
"""
import base64
import json
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

CREDS_PATH = "C:/Users/accts/scratchpad/blue-ocean-hub-credentials.json"
LEADS_SHEET_ID = "1hMQlOsobwaMvHYMDZh_QPM376U4B36RBFJ6qtfPF0uM"
LOG_PATH = "C:/Users/accts/scratchpad/blue-ocean-hub-newsletter.log"

SENDER_NAME = "Blue Ocean Hub"
SENDER_EMAIL = "accts.pak@gmail.com"
SITE_URL = "https://blueoceanhub.info"

NEWSLETTER_SUBJECT = "Blue Ocean Weekly: Strategic Finance & SaaS Intelligence"


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
    try:
        req = urllib.request.Request(
            "https://gmail.googleapis.com/gmail/v1/users/me/profile",
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


def sheets_read(token, range_name):
    encoded = urllib.parse.quote(range_name, safe="!")
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{LEADS_SHEET_ID}/values/{encoded}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        return json.loads(resp.read().decode()).get("values", [])
    except urllib.error.HTTPError as e:
        log(f"  Sheet read failed: {e.code}")
        return []


def sheets_append(token, range_name, values):
    encoded = urllib.parse.quote(range_name, safe="!")
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{LEADS_SHEET_ID}/values/{encoded}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS"
    data = json.dumps({"values": values}).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        log(f"  Sheet append failed: {e.code}")
        return None


def send_email(token, to_email, to_name, subject, html_body):
    message = f"""From: {SENDER_NAME} <{SENDER_EMAIL}>
To: {to_name} <{to_email}>
Subject: {subject}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

{html_body}
"""
    encoded = base64.urlsafe_b64encode(message.encode("utf-8")).decode("utf-8")
    body = {"raw": encoded}
    req = urllib.request.Request(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        data=json.dumps(body).encode(),
        method="POST",
    )
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        log(f"  Send failed to {to_email}: {e.code} {e.read().decode()[:200]}")
        return None


def newsletter_html(name):
    return f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a192f;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
<tr><td style="padding:32px 24px;text-align:center;background:linear-gradient(135deg,#0a192f,#112240);">
  <h1 style="color:#d4af37;margin:0;font-size:24px;letter-spacing:1px;">BLUE OCEAN HUB</h1>
  <p style="color:#64ffda;margin:8px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Strategic Finance & SaaS Intelligence</p>
</td></tr>
<tr><td style="padding:32px 24px;background:#0a192f;">
  <p style="color:#e2e8f0;font-size:16px;line-height:1.6;">Hi {name or "there"},</p>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;">
    Welcome to Blue Ocean Weekly. Each issue surfaces one untapped gap in the
    finance and SaaS landscape, with a concrete implementation playbook.
  </p>
  <div style="background:#112240;border-left:3px solid #d4af37;padding:16px;margin:24px 0;border-radius:4px;">
    <p style="color:#d4af37;font-size:12px;margin:0 0 8px;letter-spacing:1px;text-transform:uppercase;">This Week</p>
    <p style="color:#e2e8f0;font-size:14px;margin:0;line-height:1.6;">
      The 2026 Pakistan freelancer compliance stack: PSEB tax filing at 0.25%,
      SBP PRC bank clearance, and SECP SMC-Pvt incorporation.
    </p>
  </div>
  <p style="text-align:center;margin:32px 0;">
    <a href="{SITE_URL}/article/2026-pakistan-freelancer-compliance-master-kit" style="background:#d4af37;color:#0a192f;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Read the Full Report</a>
  </p>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;">
    Explore more at <a href="{SITE_URL}" style="color:#64ffda;">blueoceanhub.info</a>.
  </p>
</td></tr>
<tr><td style="padding:24px;text-align:center;background:#071120;">
  <p style="color:#64748b;font-size:11px;margin:0;">
    You are receiving this because you subscribed via blueoceanhub.info.<br>
    <a href="{SITE_URL}/unsubscribe" style="color:#64748b;">Unsubscribe</a>
  </p>
</td></tr>
</table>
</body>
</html>"""


def main():
    log("=== Newsletter send started ===")
    creds = get_token()
    token = creds["access_token"]

    # Read subscribers from Newsletter Subscribers tab
    rows = sheets_read(token, "Newsletter Subscribers!A2:G1000")
    if not rows:
        # Fall back to Leads tab
        rows = sheets_read(token, "Leads!A2:I1000")

    subscribers = []
    for r in rows:
        if len(r) >= 3 and r[2] and "@" in str(r[2]):
            subscribers.append({"name": r[1] if len(r) > 1 else "", "email": r[2]})

    if not subscribers:
        log("  No subscribers found — nothing to send")
        return

    log(f"  Found {len(subscribers)} subscribers")
    sent = 0
    for sub in subscribers:
        result = send_email(token, sub["email"], sub["name"], NEWSLETTER_SUBJECT, newsletter_html(sub["name"]))
        if result:
            sent += 1
            # Log the send in the sheet
            sheets_append(token, "Newsletter Subscribers!A:G", [[
                datetime.now().strftime("%Y-%m-%d"),
                sub["name"], sub["email"], "Newsletter", "Yes", "Sent",
                datetime.now().strftime("%Y-%m-%d %H:%M"),
            ]])
    log(f"=== Newsletter sent to {sent}/{len(subscribers)} subscribers ===")


if __name__ == "__main__":
    main()
