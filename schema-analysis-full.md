# Supabase Database Schema Analysis

**Project ID:** pejazpkzhgrafusepcvb
**Generated:** 2026-03-31T10:50:34.372Z

## Tables Overview

| Table | Rows | Description |
|-------|------|-------------|
| registrations | 64 | Team registration data |
| draw_results | 32 | Tournament draw results |
| matches | 60 | Match schedule |
| match_scores | 34 | Match scores |
| users | 1 | Admin user accounts |
| settings | 1 | Tournament settings |


## Detailed Schema

### registrations

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| school_name | varchar(255) | NO | - | UNIQUE |
| school_address | varchar(255) | NO | - | - |
| whatsapp | varchar(255) | NO | - | - |
| level | varchar(255) | NO | - | - |
| gender | varchar(255) | NO | - | - |
| logo_url | unknown | YES | - | - |
| players | jsonb | NO | - | - |
| officials | jsonb | NO | - | - |
| status | varchar(255) | NO | - | CHECK (status IN (...)) |
| created_at | timestamp with time zone | NO | now() | DEFAULT now() |
| updated_at | timestamp with time zone | NO | now() | - |

### draw_results

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| category | varchar(255) | NO | - | - |
| match_index | integer | NO | - | - |
| team1 | varchar(255) | NO | - | - |
| team2 | varchar(255) | NO | - | - |
| created_at | timestamp with time zone | NO | now() | DEFAULT now() |

### matches

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| category | varchar(255) | NO | - | - |
| round | varchar(255) | NO | - | - |
| match_number | integer | NO | - | - |
| day | integer | NO | - | - |
| match_time | varchar(255) | NO | - | - |
| team1 | varchar(255) | NO | - | - |
| team2 | varchar(255) | NO | - | - |
| team1_from | unknown | YES | - | - |
| team2_from | unknown | YES | - | - |
| status | varchar(255) | NO | - | CHECK (status IN (...)) |
| created_at | timestamp with time zone | NO | now() | DEFAULT now() |
| updated_at | timestamp with time zone | NO | now() | - |

### match_scores

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| match_key | varchar(255) | NO | - | - |
| score1 | integer | NO | - | - |
| score2 | integer | NO | - | - |
| created_at | timestamp with time zone | NO | now() | DEFAULT now() |
| updated_at | timestamp with time zone | NO | now() | - |

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

