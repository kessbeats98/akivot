# REQ-18: Real Onboarding Flow

## Goal
Replace /onboarding placeholder with a minimal wizard that creates
either a walker profile or dog owner profile based on user choice.

## Scope
- Step 1: Role selection (בעל כלב / דוגווקר)
- Step 2a owner: form (dog name, breed optional) → INSERT dogs + dogOwners → /owner/dashboard
- Step 2b walker: form (display name) → INSERT walkerProfiles → /walker/dashboard
- Server actions for both inserts
- If user already has profile → skip, redirect to correct dashboard

## Acceptance Criteria
- [ ] PASS if: fresh user sees role selection at /onboarding
- [ ] PASS if: owner flow creates row in dogs + dogOwners tables
- [ ] PASS if: walker flow creates row in walkerProfiles table
- [ ] PASS if: existing profile → redirect, no re-onboarding
- [ ] PASS if: both flows end on correct role dashboard
- [ ] PASS if: npm run build passes with 0 errors

## Out of Scope
Photo upload, multiple dogs v1, edit profile, email notifications, dog size (no schema column)

## Risk Tier
MEDIUM — writes to DB (dogs, dogOwners, walkerProfiles)

## Schema Notes
- walkerProfiles requires: userId, displayName, inviteCode (unique), updatedAt
- inviteCode: auto-generated random string (no existing generator)
- dogs requires: name, updatedAt; breed optional
- dogOwners requires: dogId, ownerUserId
- createDog() in dogsRepo already handles dog+owner insert in tx — reuse it
