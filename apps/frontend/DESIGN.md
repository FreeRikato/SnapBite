---
name: SnapBite
version: "mvp-v1"
positioning: "A photo-based calorie tracker for people who hate logging food."
colors:
  background-dark: "#181A1F"
  background-light: "#FFFFFF"
  surface-dark: "#242832"
  surface-light: "#F7F8FA"
  text-primary-dark: "#FFFFFF"
  text-primary-light: "#111318"
  text-secondary-dark: "#A3A8B3"
  text-secondary-light: "#5F6673"
  accent-calories: "#2F80ED"
  accent-protein: "#D94862"
  accent-carbs: "#E0A72E"
  accent-fats: "#3E9B79"
  confidence-low: "#D96C4A"
  confidence-medium: "#D8A132"
  confidence-high: "#3E9B79"
  border-light: "#E5E7EB"
typography:
  headline-large:
    fontFamily: "Inter, SF Pro Display, sans-serif"
    fontSize: "2.25rem"
    fontWeight: "700"
  headline-medium:
    fontFamily: "Inter, SF Pro Display, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "700"
  body-base:
    fontFamily: "Inter, SF Pro Text, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
  label-bold:
    fontFamily: "Inter, SF Pro Text, sans-serif"
    fontSize: "0.875rem"
    fontWeight: "600"
  stat-number:
    fontFamily: "Inter, SF Pro Display, sans-serif"
    fontSize: "1.75rem"
    fontWeight: "700"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.text-primary-light}"
    textColor: "{colors.background-light}"
    rounded: "{rounded.full}"
    padding: "16px"
  button-secondary:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.full}"
    padding: "16px"
  meal-photo-card:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.lg}"
    padding: "12px"
  estimate-card:
    backgroundColor: "{colors.background-light}"
    rounded: "{rounded.xl}"
    padding: "24px"
  confidence-badge:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
---

## Overview

SnapBite is a photo-first calorie tracking app. The product value is not BMI calculation; BMI is only onboarding context. The core promise is: "I ate this, tell me roughly how many calories."

The experience should make food logging feel natural by prioritizing meal photos over manual calorie entry. Users take or upload 1-4 photos, optionally add a short description such as "2 idlis, sambar, chutney" or "homemade chicken biryani", then review an AI-generated estimate they can quickly confirm or edit.

## Product Positioning

Position SnapBite as:

"A photo-based calorie tracker for people who hate logging food."

The app should feel honest, practical, and fast. It should never imply that AI food estimation is perfectly accurate. Estimates must be presented as ranges with confidence and clear ways to improve accuracy.

## Core Flow

1. User logs in.
2. User enters height, weight, age, gender, and goal.
3. App calculates BMI and a rough daily calorie target.
4. User takes or uploads 1-4 meal photos.
5. User optionally adds a short food description.
6. AI estimates food items, portion size, calories, protein, carbs, fat, and confidence level.
7. User confirms or edits the estimate.
8. App tracks daily calories against the target.

## MVP v1

The first version should focus tightly on the core tracking loop:

*   Auth
*   Height, weight, age, gender, and BMI onboarding
*   Goal selection: lose, maintain, or gain
*   Daily calorie target
*   Upload multiple meal photos
*   Optional meal description
*   AI calorie and macro estimate
*   User confirmation and quick editing
*   Daily dashboard
*   History by date

## Later Features

Future versions can add:

*   Protein goal
*   Meal reminders
*   Weight trend
*   Weekly reports
*   Saved frequent meals
*   Indian food presets
*   Barcode scanning
*   HealthKit and native app integration

## Design Principles

### Photo First

The meal photo is the primary artifact. The UI should make photo capture and upload the most obvious action, with optional text treated as a helpful accuracy boost rather than a required logging step.

### Honest Estimation

AI results should be framed as practical estimates, not exact nutrition facts. Always show a calorie range, confidence level, and editable assumptions when available.

### BMI as Context

BMI belongs in onboarding and profile context only. It should support the initial calorie target calculation, but it must not dominate the dashboard or product positioning.

### Fast Confirmation

The user should be able to accept an estimate quickly, adjust obvious misses, or add missing context without entering a complex nutrition form.

## Colors

The color palette supports a clean calorie tracking interface with strong contrast and restrained nutrition accents:

*   **Neutral App Base:** White and near-black surfaces keep food photos and numbers readable.
*   **Calorie Accent (`#2F80ED`):** Used for daily target progress and primary calorie metrics.
*   **Macro Accents:**
    *   **Protein (`#D94862`):** Used for protein values and progress.
    *   **Carbs (`#E0A72E`):** Used for carbohydrate values and progress.
    *   **Fats (`#3E9B79`):** Used for fat values and progress.
*   **Confidence States:** Low, medium, and high confidence should use distinct warm-to-green indicators without alarmist styling.

## Typography

Typography should prioritize quick scanning:

*   **Large Numbers:** Daily calories, remaining target, and estimate ranges should use bold display styling.
*   **Readable Detail Text:** Food item names, assumptions, and edit fields should stay compact and legible.
*   **Clear Labels:** Confidence, macros, and portion assumptions should be labeled plainly.

## Layout & Spacing

The main layout should center on daily tracking and recent meals:

*   **Dashboard:** Show calories consumed vs target, remaining calories, today's meals, and quick photo logging.
*   **Photo Upload Flow:** Support 1-4 images with stable thumbnails and clear add/remove actions.
*   **Estimate Review:** Present calorie range first, then food items, portion assumptions, macros, confidence, and edit controls.
*   **History:** Organize meals by date with calorie totals and expandable meal details.

## Components

### Photo Logger

The photo logger should make camera/upload the primary action. It should support multiple meal photos, optional text description, and a compact preview grid.

### Estimate Card

The estimate card should show:

*   Calorie range
*   Confidence level
*   Food items detected
*   Portion-size assumptions
*   Protein, carbs, and fat
*   Prompt to improve accuracy with quantity or ingredients
*   Confirm and edit actions

### Daily Dashboard

The dashboard should show daily calories versus target, confirmed meals, pending estimates, and history access. BMI should not be a primary dashboard module.

## Do's and Don'ts

### Do's

*   Lead with photo capture and recent meal logging.
*   Show estimates as ranges, not exact values.
*   Make confidence visible and understandable.
*   Let users quickly confirm or edit AI assumptions.
*   Keep BMI and calorie target setup in onboarding/profile context.

### Don'ts

*   Do not position BMI as the main feature.
*   Do not imply AI nutrition estimates are exact.
*   Do not force manual calorie entry before photo logging.
*   Do not bury confidence or assumptions behind secondary screens.
*   Do not overcomplicate MVP v1 with later features.
