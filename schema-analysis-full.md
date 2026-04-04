# Supabase Database Schema Analysis

**Project ID:** pejazpkzhgrafusepcvb
**Generated:** 2026-04-04T05:08:42.070Z

## Tables Overview

| Table | Rows | Description |
|-------|------|-------------|
| registrations | 0 | Team registration data |
| draw_results | 0 | Tournament draw results |
| matches | 0 | Match schedule |
| match_scores | 0 | Match scores |
| users | 1 | Admin user accounts |
| settings | 1 | Tournament settings |


## Detailed Schema

### users

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| username | varchar(255) | NO | - | UNIQUE |
| password_hash | varchar(255) | NO | - | - |
| role | varchar(255) | NO | - | - |
| full_name | unknown | YES | - | - |
| email | unknown | YES | - | - |
| is_active | boolean | NO | false | - |
| created_at | timestamp with time zone | NO | now() | DEFAULT now() |
| updated_at | timestamp with time zone | NO | now() | - |

### settings

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| bank_name | varchar(255) | NO | - | - |
| account_number | varchar(255) | NO | - | - |
| account_name | varchar(255) | NO | - | - |
| registration_fee | varchar(255) | NO | - | - |
| whatsapp_contact | varchar(255) | NO | - | - |
| created_at | timestamp with time zone | NO | now() | DEFAULT now() |
| updated_at | timestamp with time zone | NO | now() | - |

