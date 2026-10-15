# Hosting & Deployment Guide

This repository is hosted on **AWS Amplify Hosting**, with domain registration and DNS managed via **Hostinger**.

---

## 1. Custom 404 Rewrite Rule (AWS Amplify Console)

Amplify static web hosting handles custom 404 error responses via redirect and rewrite rules configured in the AWS Amplify Console (under **Hosting > Rewrites and redirects**), rather than in-repo configuration files.

Add the following rule in the Amplify Console:

| Field | Value | Notes |
|---|---|---|
| **Source address** | `/<*>` | Matches unmatched routes *(verify in console)* |
| **Target address** | `/404.html` | Serves the custom 404 document |
| **Type** | `404 (Rewrite)` | Rewrites without changing the URL *(verify in console)* |

> **[IMPORTANT] Verify in console:**
> In the AWS Amplify Console, ensure this 404 rewrite rule is ordered **after** any default static asset rules (or verify that static assets with extensions like `.css`, `.js`, `.woff2`, `.png` are resolved before fallback). If using Amplify's default redirect table, you may edit the existing `404 (Redirect)` or `404 (Rewrite)` entry directly.

---

## 2. DNS Configuration (Hostinger & AWS Amplify)

1. **Registrar & DNS Management:**
   - The domain is registered at **Hostinger**.
   - All DNS records (CNAME, ALIAS/ANAME, and TXT validation records) live and are managed at **Hostinger DNS**.
2. **Amplify Domain Association:**
   - In AWS Amplify Console, navigate to **Hosting > Custom domains** and select **Add domain**.
   - Amplify generates the exact DNS target records (e.g. `dxxxxxxxxxxxx.cloudfront.net` or CNAME target) and an `_acme-challenge` CNAME record for SSL/TLS verification.
3. **Point Hostinger to Amplify:**
   - Create the CNAME record for your root/subdomain in Hostinger DNS pointing to the Amplify-provided domain target.
   - Add the ACM ownership verification CNAME record in Hostinger.
4. **HTTPS / SSL Certificate:**
   - **AWS Amplify automatically provisions and manages the SSL/TLS HTTPS certificate** via AWS Certificate Manager (ACM) once DNS verification records are detected.
   - Certificate renewals are automatic as long as the DNS verification records remain active at Hostinger.
