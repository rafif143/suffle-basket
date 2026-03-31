# Supabase Database Schema Analysis

Project: pejazpkzhgrafusepcvb
Generated: 2026-03-31T10:49:40.677Z

## Tables Overview

| Table Name | Column Count |
|------------|-------------|
| registrations | 12 |
| draw_results | 6 |
| matches | 13 |
| match_scores | 6 |
| users | 9 |
| profiles | 0 |
| settings | 8 |
| admin_users | 0 |


## Detailed Column Definitions

### registrations

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|
| id | string | - | - |
| school_name | string | - | - |
| school_address | string | - | - |
| whatsapp | number | - | - |
| level | string | - | - |
| gender | string | - | - |
| logo_url | unknown | - | - |
| players | object | - | - |
| officials | object | - | - |
| status | string | - | - |
| created_at | timestamp | - | - |
| updated_at | timestamp | - | - |

### draw_results

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|
| id | string | - | - |
| category | string | - | - |
| match_index | timestamp | - | - |
| team1 | string | - | - |
| team2 | string | - | - |
| created_at | timestamp | - | - |

### matches

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|
| id | string | - | - |
| category | string | - | - |
| round | string | - | - |
| match_number | timestamp | - | - |
| day | timestamp | - | - |
| match_time | string | - | - |
| team1 | string | - | - |
| team2 | string | - | - |
| team1_from | unknown | - | - |
| team2_from | unknown | - | - |
| status | string | - | - |
| created_at | timestamp | - | - |
| updated_at | timestamp | - | - |

### match_scores

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|
| id | string | - | - |
| match_key | string | - | - |
| score1 | number | - | - |
| score2 | number | - | - |
| created_at | timestamp | - | - |
| updated_at | timestamp | - | - |

### users

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|
| id | string | - | - |
| username | string | - | - |
| password_hash | string | - | - |
| role | string | - | - |
| full_name | unknown | - | - |
| email | unknown | - | - |
| is_active | boolean | - | - |
| created_at | timestamp | - | - |
| updated_at | timestamp | - | - |

### profiles

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|

### settings

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|
| id | string | - | - |
| bank_name | string | - | - |
| account_number | number | - | - |
| account_name | string | - | - |
| registration_fee | number | - | - |
| whatsapp_contact | number | - | - |
| created_at | timestamp | - | - |
| updated_at | timestamp | - | - |

### admin_users

| Column | Type (inferred) | Nullable | Default |
|--------|-----------------|----------|---------|

