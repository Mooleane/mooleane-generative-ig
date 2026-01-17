Generative Instagram with AI
Due Date: All submissions must be submitted from your own repo by Thursday January 9th at 11:59pm in GitHub Classroom.
You are going to build a Generative Instagram with AI app using DALL·E 2 API, Prisma ORM, and Next.js - demonstrating your mastery of backend development with ORM configuration and API architecture design.

🎯 Technical Skills Assessment
This project demonstrates the following competencies:
TS.3.3: Configure servers (Object Relational Mapping with Prisma)
TS.3.4: Design systems & architecture (RESTful API design and data flow)

📸 Project Overview
Instagram is so 2023! Instead of taking photos yourself, you'll generate them with AI and share them with friends and the world.
This project guides you through building a full-stack application that uses Next.js/React, OpenAI's DALL·E 2, and Prisma ORM with PostgreSQL to store and manage AI-generated published images.

Tech Stack
Frontend: Next.js 16.1.1 (App Router), React 19.2.3
Backend: Next.js API Routes (Node.js)
ORM: Prisma 7.2.0 with Neon adapter (TS.3.3)
Database: PostgreSQL via Neon.com (serverless)
AI Service: OpenAI DALL·E 2 API
Testing: Vitest 4.0.16
Package Manager: pnpm

What You Must Submit
Use this checklist to track your progress. All items must be completed and passing tests to demonstrate competency in TS.3.3 and TS.3.4.
✅ TS.3.3: ORM Configuration (Prisma)
Database Schema Setup
[ ] Prisma installed as dev dependency (prisma@^7.2.0)
[ ] @prisma/client installed (^7.2.0)
[ ] Neon adapter packages installed (@neondatabase/serverless, @prisma/adapter-neon, ws)
[ ] .env file exists with DATABASE_URL
[ ] .env file gitignored (never committed)
[ ] .env.example provided with placeholder values
[ ] prisma.config.ts configured for Neon adapter
[ ] Connection string includes ?sslmode=require
PublishedImage Model Definition
[ ] Model named exactly PublishedImage
[ ] id field: Int, @id, @default(autoincrement())
[ ] imageUrl field: String, @map("image_url")
[ ] prompt field: String (required)
[ ] hearts field: Int, @default(0)
[ ] createdAt field: DateTime, @default(now()), @map("created_at")
[ ] Table mapped to published_images with @@map("published_images")
Migrations & Client Generation
[ ] prisma/migrations/ directory exists with migration files
[ ] Migration creates published_images table with correct schema
[ ] All field mappings (snake_case) applied in SQL
[ ] Prisma Client generated successfully (npx prisma generate)
[ ] Can import and use @prisma/client in code
Prisma Adapter Configuration
[ ] Neon adapter initialized with Pool (not Client)
[ ] neonConfig.webSocketConstructor = ws configured for Node.js
[ ] Pool created with process.env.DATABASE_URL
[ ] PrismaNeon adapter created from pool
[ ] PrismaClient initialized with adapter
[ ] Connection pooling working in all API endpoints
CRUD Operations (Tested)
[ ] prisma.publishedImage.create() works
[ ] prisma.publishedImage.findUnique() works
[ ] prisma.publishedImage.findMany() works
[ ] prisma.publishedImage.update() works
[ ] prisma.publishedImage.delete() works
[ ] prisma.publishedImage.count() works
[ ] prisma.publishedImage.createMany() works
Query Operations (Tested)
[ ] Ordering by createdAt descending works
[ ] Pagination with skip and take works
[ ] count() returns accurate total for pagination
[ ] totalPages calculated correctly
[ ] Where clause filtering works
Schema Tests Passing
[ ] Test 1.1: PublishedImage model exists ✓
[ ] Test 1.2: id field is Int with autoincrement ✓
[ ] Test 1.3-1.6: All fields have correct types ✓
[ ] Test 1.7: hearts default value is 0 ✓
[ ] Test 1.8: createdAt auto-generates timestamp ✓
[ ] Test 2.1-2.7: All CRUD operations work ✓
[ ] Test 3.1-3.5: Query operations work ✓
[ ] Test 4.1-4.4: Field constraints enforced ✓
[ ] Test 5.1-5.3: Database connection works ✓

✅ TS.3.4: API Architecture & System Design
API Endpoint 1: POST /api/generate
[ ] Endpoint file exists: app/api/generate/route.js
[ ] Accepts POST requests only
[ ] Validates prompt field (required, non-empty string)
[ ] Returns 400 for missing prompt
[ ] Returns 400 for empty string prompt
[ ] Returns 400 for null prompt
[ ] Returns 400 for non-string prompt
[ ] Calls OpenAI DALL·E 2 API with prompt
[ ] Uses model: "dall-e-2", n: 1, size: "512x512"
[ ] Extracts imageUrl from response.data[0].url
[ ] Returns 200 on success
[ ] Response includes { "imageUrl": "https://...", "prompt": "..." }
[ ] Returns 500 for OpenAI API errors
[ ] Error response includes descriptive message
[ ] Logs errors to console
Tests Passing:
[ ] Test G.1: Generate with valid prompt returns 200 ✓
[ ] Test G.2: Missing prompt returns 400 ✓
[ ] Test G.3: Empty prompt returns 400 ✓
[ ] Test G.4: Null prompt returns 400 ✓
[ ] Test G.5: Non-string prompt returns 400 ✓
[ ] Test G.6: Response has imageUrl field ✓
[ ] Test G.7: Response has prompt field ✓
[ ] Test G.8: OpenAI API error returns 500 ✓

API Endpoint 2: POST /api/publish
[ ] Endpoint file exists: app/api/publish/route.js
[ ] Accepts POST requests only
[ ] Validates imageUrl field (required, non-empty string)
[ ] Validates prompt field (required, non-empty string)
[ ] Returns 400 for missing imageUrl
[ ] Returns 400 for missing prompt
[ ] Returns 400 for missing both fields
[ ] Returns 400 for empty imageUrl
[ ] Allows empty prompt (edge case)
[ ] Uses prisma.publishedImage.create() to save record
[ ] Default hearts set to 0 by schema
[ ] Default createdAt set to now() by schema
[ ] Returns 201 status on successful creation
[ ] Response includes complete object: { id, imageUrl, prompt, hearts, createdAt }
[ ] Returns 500 for database errors
[ ] Record persists in database after API call
[ ] Logs errors to console
Tests Passing:
[ ] Test P.1: Publish with valid data returns 201 ✓
[ ] Test P.2: Missing imageUrl returns 400 ✓
[ ] Test P.3: Missing prompt returns 400 ✓
[ ] Test P.4: Missing both fields returns 400 ✓
[ ] Test P.5: Empty imageUrl returns 400 ✓
[ ] Test P.6: Empty prompt allowed returns 201 ✓
[ ] Test P.7: Record created in database ✓
[ ] Test P.8: Default hearts is 0 ✓
[ ] Test P.9: createdAt auto-generated ✓
[ ] Test P.10: Response has all fields ✓
[ ] Test P.11: Database error returns 500 ✓

API Endpoint 3: GET /api/feed
[ ] Endpoint file exists: app/api/feed/route.js
[ ] Accepts GET requests
[ ] Parses query parameter page (default: 1)
[ ] Parses query parameter limit (default: 10, max: 50)
[ ] Converts query params to integers with parseInt()
[ ] Calculates skip = (page - 1) * limit
[ ] Uses prisma.publishedImage.findMany() with skip/take
[ ] Orders by createdAt descending (newest first)
[ ] Uses prisma.publishedImage.count() for total
[ ] Calculates totalPages = Math.ceil(total / limit)
[ ] Returns 200 on success
[ ] Response includes: { images: [], total: number, page: number, totalPages: number }
[ ] Returns empty array when database is empty
[ ] Returns empty array when page exceeds totalPages
[ ] Returns 400 for invalid page (negative, 0)
[ ] Returns 400 for invalid limit (0, negative)
[ ] Caps limit at 50 if exceeded
[ ] Returns 500 for database errors
[ ] Logs errors to console
Tests Passing:
[ ] Test FG.1: Get feed with defaults returns 200 ✓
[ ] Test FG.2: Get feed page 1 returns first 10 ✓
[ ] Test FG.3: Get feed page 2 with limit 5 works ✓
[ ] Test FG.4: Images ordered by createdAt desc ✓
[ ] Test FG.5: Total count is correct ✓
[ ] Test FG.6: totalPages calculated correctly ✓
[ ] Test FG.7: Page defaults to 1 ✓
[ ] Test FG.8: Limit defaults to 10 ✓
[ ] Test FG.9: Invalid page returns 400 ✓
[ ] Test FG.10: Invalid limit returns 400 ✓
[ ] Test FG.11: Limit exceeding max capped at 50 ✓
[ ] Test FG.12: Empty database returns empty array ✓
[ ] Test FG.13: Database error returns 500 ✓

API Endpoint 4: PUT /api/feed
[ ] Endpoint file exports PUT handler in app/api/feed/route.js
[ ] Accepts PUT requests
[ ] Validates id field (required, number)
[ ] Validates hearts field (required, non-negative integer)
[ ] Returns 400 for missing id
[ ] Returns 400 for missing hearts
[ ] Returns 400 for non-number id
[ ] Returns 400 for non-number hearts
[ ] Returns 400 for negative hearts
[ ] Returns 404 when image ID doesn't exist
[ ] Uses prisma.publishedImage.update() with atomic operation
[ ] Updates with { where: { id }, data: { hearts } }
[ ] Returns 200 on successful update
[ ] Response includes updated image object
[ ] Database updated correctly (verified by subsequent GET)
[ ] Atomic update prevents race conditions
[ ] Returns 500 for database errors
[ ] Logs errors to console
Tests Passing:
[ ] Test FP.1: Update hearts with valid data returns 200 ✓
[ ] Test FP.2: Missing id returns 400 ✓
[ ] Test FP.3: Missing hearts returns 400 ✓
[ ] Test FP.4: Non-existent id returns 404 ✓
[ ] Test FP.5: Non-number id returns 400 ✓
[ ] Test FP.6: Non-number hearts returns 400 ✓
[ ] Test FP.7: Negative hearts returns 400 ✓
[ ] Test FP.8: Hearts set to 0 works ✓
[ ] Test FP.9: Database updated correctly ✓
[ ] Test FP.10: Atomic update works ✓
[ ] Test FP.11: Database error returns 500 ✓

✅ Frontend Implementation
Generate Page (app/page.js)
[ ] Page file exists
[ ] Prompt input field (textarea or text input)
[ ] Generate button triggers API call to /api/generate
[ ] Loading state shown during generation
[ ] Disable generate button while loading
[ ] Show loading spinner or message
[ ] Generated image displayed after success
[ ] Show prompt text used for generation
[ ] Error message displayed on API failure
[ ] Publish button appears after image generation
[ ] Publish calls POST /api/publish with imageUrl and prompt
[ ] Shows success message after publishing
[ ] Handles errors gracefully
Feed Page (app/feed/page.js)
[ ] Page file exists in app/feed/
[ ] Fetches feed from GET /api/feed endpoint
[ ] Displays all published images in grid/list layout
[ ] Each image shows: imageUrl, prompt, hearts count, createdAt
[ ] Newest images appear first
[ ] Heart button/icon for each image
[ ] Clicking heart calls PUT /api/feed to update count
[ ] Optimistic UI update (shows immediately)
[ ] Pagination controls (Load More or page numbers)
[ ] Fetches next page when clicked
[ ] Shows loading state during fetch
[ ] Handles end of feed gracefully (no more pages)
[ ] Handles errors gracefully
[ ] Error messages for failed requests

✅ Documentation & Architecture
README.md
[ ] Project title and description
[ ] Technical skills badges (TS.3.3, TS.3.4)
[ ] Prerequisites listed (Node.js, pnpm, Neon account, OpenAI API key)
[ ] Setup instructions (clone, install, env setup, migrate, run)
[ ] Environment variable configuration explained
[ ] Commands documented (dev, build, test, migrate)
[ ] Link to API documentation
[ ] Link to architecture documentation
[ ] Tech stack listed
[ ] Troubleshooting section
Architecture Documentation (docs/architecture-diagram.png or .jpg)
[ ] Diagram created showing:
[ ] Client layer (React/Next.js)
[ ] API Routes layer (/api/generate, /api/publish, /api/feed)
[ ] External services (OpenAI DALL·E 2)
[ ] Database layer (Prisma + Neon PostgreSQL)
[ ] Data flow arrows between components
[ ] Saved as image file in docs/ folder
Data Flow Documentation (docs/DATA-FLOW.md)
[ ] Image generation flow documented (input → OpenAI → display)
[ ] Publishing flow documented (selection → database → confirmation)
[ ] Feed retrieval flow documented (request → query → display)
[ ] Hearts update flow documented (click → update → refresh)
API Documentation (docs/API.md)
[ ] All 4 endpoints documented with:
[ ] HTTP method and URL
[ ] Request body/query parameters with types
[ ] Success response with status code and example
[ ] Error responses with all status codes (400, 404, 500)
[ ] Description of endpoint purpose
[ ] Request/response examples in JSON format
[ ] Status code usage explained (200 vs 201 vs 400 vs 404 vs 500)
[ ] Validation rules documented for all fields

✅ Testing Suite
Vitest Configuration
[ ] vitest.config.js exists with proper configuration
[ ] Test environment set to node
[ ] setup/testSetup.js configured with:
[ ] beforeAll hook running prisma db push
[ ] beforeEach hook cleaning published_images table
[ ] afterEach hook disconnecting Prisma Client
[ ] Tests use Pool adapter (not Client)
Test Files Created
[ ] tests/database-schema.test.js exists (15+ tests)
[ ] tests/api-generate.test.js exists (8+ tests)
[ ] tests/api-publish.test.js exists (10+ tests)
[ ] tests/api-feed-get.test.js exists (12+ tests)
[ ] tests/api-feed-put.test.js exists (10+ tests)
All Tests Passing
[ ] Run pnpm test successfully
[ ] All 55+ tests pass
[ ] No skipped or pending tests
[ ] No test warnings or errors
[ ] Test coverage includes happy path, errors, and edge cases
[ ] Test output shows 100% passing

✅ Environment & Configuration
Environment Variables
[ ] .env file exists in project root
[ ] DATABASE_URL configured for Neon PostgreSQL
[ ] OPENAI_API_KEY configured for DALL·E 2 access
[ ] .env.example file provided with placeholder values
[ ] .gitignore includes .env (never committed)
[ ] Connection string includes ?sslmode=require
Project Structure
/
├── app/
│   ├── page.js                 # Generate page
│   ├── feed/
│   │   └── page.js             # Feed page
│   └── api/
│       ├── generate/
│       │   └── route.js        # POST /api/generate
│       ├── publish/
│       │   └── route.js        # POST /api/publish
│       └── feed/
│           └── route.js        # GET & PUT /api/feed
├── prisma/
│   ├── schema.prisma           # PublishedImage model
│   └── migrations/             # Migration files
├── tests/
│   ├── database-schema.test.js
│   ├── api-generate.test.js
│   ├── api-publish.test.js
│   ├── api-feed-get.test.js
│   └── api-feed-put.test.js
├── docs/
│   ├── API.md
│   ├── DATA-FLOW.md
│   └── architecture-diagram.png
├── setup/
│   └── testSetup.js
├── .env (gitignored)
├── .env.example
├── prisma.config.ts
├── vitest.config.js
└── README.md


Setup Instructions
1. Prerequisites
Node.js 18+ installed
pnpm installed (npm install -g pnpm)
Neon.com account (free tier)
OpenAI API key with DALL·E 2 access
2. Clone and Install
git clone <your-github-classroom-repo>
cd <repo-name>
pnpm install

3. Environment Configuration
# Copy example env file
cp .env.example .env

# Edit .env and add your credentials:
DATABASE_URL='postgresql://user:password@host/database?sslmode=require'
OPENAI_API_KEY='sk-...'

4. Database Setup (TS.3.3)
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view data
npx prisma studio

5. Run Development Server
pnpm dev
# Open http://localhost:3000

6. Run Tests
pnpm test              # Run all tests
pnpm test:watch        # Run in watch mode


Grading Rubric (100 Points)
Category
Points
Criteria
TS.3.3: Schema Definition
10
PublishedImage model with all fields, correct types, defaults
TS.3.3: Migrations
5
Migration files exist and apply successfully
TS.3.3: Prisma Client
5
Generated and imported correctly in all endpoints
TS.3.3: CRUD Operations
10
All operations (create, read, update, delete) work
TS.3.3: Queries
10
Pagination, ordering, counting work correctly
TS.3.3: Adapter Config
10
Neon adapter with Pool configured properly
TS.3.4: API Endpoints
15
All 4 endpoints implemented with correct HTTP methods
TS.3.4: Status Codes
10
Proper use of 200, 201, 400, 404, 500
TS.3.4: Request Validation
10
All endpoints validate input correctly
TS.3.4: Error Handling
10
Consistent error responses across all endpoints
TS.3.4: Pagination
5
Feed endpoint implements page/limit correctly
Tests Pass
10
All 55+ tests pass without errors
TOTAL
100




Troubleshooting
Issue: Prisma Client not found
Solution:
npx prisma generate
# Restart your dev server after generating

Issue: Database connection errors
Solution:
Check DATABASE_URL in .env is correct
Ensure connection string includes ?sslmode=require
Verify Neon database is active (not hibernated)
Check if using Pool adapter (not Client)
Issue: OpenAI API errors
Solution:
Verify OPENAI_API_KEY is set in .env
Check API key has DALL·E 2 access
Ensure account has credits available
Check for rate limiting (wait and retry)
Issue: Tests timing out
Solution:
Increase timeout in vitest.config.js (hookTimeout: 60000)
Verify DATABASE_URL is accessible from test environment
Check if using Pool adapter in test setup
Ensure .env file is in project root
Issue: Migration fails
Solution:
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name init


Resources
Prisma Documentation
Next.js API Routes
Neon PostgreSQL
OpenAI DALL·E 2 API
Vitest Testing Framework
CLAUDE.md - Detailed technical guidance for this project
api-test-success-criteria.md - Complete test specifications

Submission Checklist
Before submitting, verify:
[ ] All dependencies installed (pnpm install)
[ ] DATABASE_URL set in .env
[ ] OPENAI_API_KEY set in .env
[ ] Prisma Client generated (npx prisma generate)
[ ] Migrations applied (npx prisma migrate dev)
[ ] All 55+ tests pass (pnpm test)
[ ] No test warnings or errors
[ ] All 4 API endpoints working
[ ] Frontend pages working (Generate & Feed)
[ ] Architecture diagram created
[ ] Data flow documentation written
[ ] API documentation complete
[ ] Code committed to GitHub
[ ] README.md updated with your implementation details

License
This is an educational project for technical skills assessment (TS.3.3 & TS.3.4).

