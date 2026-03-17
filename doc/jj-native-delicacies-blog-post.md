# Building J&J Native Delicacies: A Full-Stack E-commerce Platform for Filipino Heritage Food

## Introduction
Many small food businesses still manage orders through chat apps, spreadsheets, and manual updates. That process can work at very small scale, but it breaks down fast when order volume grows. Customers experience delayed replies, unclear payment status, and inconsistent delivery communication.

I built **J&J Native Delicacies** to solve this gap: a production-ready, full-stack e-commerce platform for authentic Filipino delicacies. The goal was simple: create a seamless customer ordering experience and give business owners the operational tools they need to run daily workflows efficiently.

## The Problem
Traditional ordering operations created several pain points:

- Limited product discoverability without a structured online catalog
- High friction checkout through manual confirmation workflows
- No reliable order tracking for customers
- Time-consuming admin tasks for menu updates, promotions, and status changes
- Inconsistent communication for confirmations and order updates

From a technical perspective, I also wanted to solve a common project challenge: how to build a single platform that balances beautiful storefront UX, secure payments, role-based admin access, and maintainable backend architecture.

## The Solution
J&J Native Delicacies is a full-stack web application that combines customer ordering, payment processing, and business operations in one system.

### 1) Customer Storefront Experience
The storefront was designed to reduce friction from discovery to checkout.

- Menu browsing with category filters, search, and responsive product grids
- Custom Bilao Builder for personalized tray combinations
- Persistent cart state with quantity adjustments and customizations
- Guest and authenticated checkout flows
- Stripe card payments with webhook-driven payment verification
- Order tracking by order number
- PWA support for a more app-like mobile experience

### 2) Admin Dashboard and Operations
The admin side focuses on day-to-day control and visibility.

- Order management across full lifecycle states
- Menu and category CRUD with availability controls
- Promotion and discount code management
- Business settings (hours, delivery zones, fees, tax, order acceptance)
- Content management for policy pages and announcement banner
- Staff and role-based access controls

### 3) Engineering Foundation
The platform was built with a production-focused architecture.

- Typed, full-stack development with Next.js App Router and TypeScript
- PostgreSQL relational modeling with Prisma ORM
- Authentication and authorization with NextAuth and JWT sessions
- Schema validation with Zod and React Hook Form
- Security hardening with route protection, validation, and defensive headers
- E2E testing using Playwright across key customer and admin journeys

## Technology Stack
- **Frontend / Full-stack framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **State management:** Zustand
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth
- **Payments:** Stripe
- **Email:** Resend
- **Testing:** Playwright
- **Deployment target:** Vercel + managed PostgreSQL

## Challenges I Faced
### Modeling real-world commerce flows
Handling guest checkout, authenticated users, custom product configurations, and order lifecycle transitions required careful schema design and API contracts.

### Keeping admin and customer concerns separated
A major challenge was maintaining clear boundaries between storefront UX and admin operations while still sharing reusable components and utilities.

### Building secure payment and auth workflows
Stripe integration and role-based access control required strict server-side checks, webhook verification, and robust validation paths.

### End-to-end quality assurance
Beyond page rendering, I needed confidence in route protection, API responses, and critical user flows. Playwright tests were essential for validating these behaviors.

## What I Learned
- Strong schema design early on prevents major refactors later.
- Full-stack TypeScript significantly improves development speed and confidence.
- Security is not one feature; it is layered across forms, APIs, sessions, and infrastructure.
- Great admin UX is just as important as customer UX in commerce products.
- Documentation (build plans, deployment guides, QA checklists) is part of product quality.

## Outcomes
J&J Native Delicacies delivered a complete, portfolio-grade commerce platform with real operational depth.

- Built an end-to-end customer ordering journey from discovery to payment
- Created an admin command center for business operations
- Implemented production-oriented architecture and testing practices
- Prepared the project for real deployment with documented operational checklists

The biggest outcome was not just shipping features. It was learning how to design and deliver a system that is both user-friendly and business-ready.

## Final Thoughts
This project represents my approach to modern web engineering: practical architecture, intentional UX, secure foundations, and strong execution from planning to deployment.

If you are building a similar platform, start with the workflow map first (customer journey + operations journey), then let that drive your schema, APIs, and UI priorities. That one decision saves a lot of time later.

