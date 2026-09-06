AEGIS: Intelligent Finance Controller and Audit Workspace

Aegis is a robust, full-stack financial controller and automated audit workspace. Designed to eliminate manual audit friction, Aegis streamlines financial data ingestion, automates reconciliation, and leverages artificial intelligence to provide real-time risk assessment and executive reporting.

Core Modules and Features
The application is structured into a linear, highly efficient financial workflow.

Secure Authentication: Encrypted session management backed by a serverless PostgreSQL database.

Data Injection: Seamless upload and parsing of structured JSON reconciliation logs directly into the database.

Automated Reconciliation: Algorithmic comparison of expected versus actual transaction volumes to instantly flag financial discrepancies.

Intelligence Q and A Agent: Integrated LLM capabilities that read structured database context to generate automated anomaly reports and executive summaries.

Cash Forecaster: A three-tier predictive modeling module that utilizes historical reconciliation data to project future corporate liquidity.

Taxation Module: Real-time estimation of tax obligations and deductible categorization based on active batch data.

System Architecture
Aegis enforces a strict separation of concerns between the presentation layer and the data controller.

Frontend UI: Next.js (App Router) with Turbopack for optimized server-side rendering and responsive client navigation.

Database and ORM: Neon PostgreSQL serverless cloud database managed seamlessly via Prisma ORM for type-safe data persistence.

AI Integration: Google Gemini API utilized for natural language processing and financial data analysis.

Prerequisites
Before running the application, ensure you have the following installed and configured: Node.js (v18.x or higher), the npm package manager, a Neon PostgreSQL database instance, and a Google Gemini API key.

Environment Configuration
Create a .env file in the root directory and configure the required environment variables. Ensure that the Neon connection string includes the SSL requirement.

DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].aws.neon.tech/neondb?sslmode=require"
GEMINI_API_KEY="your_google_gemini_api_key_here"

Installation and Local Setup
First, clone the repository from GitHub:
git clone https://github.com/theaadityapaul/AEGIS-FINANCE-CONTROLLER.git

Next, navigate into the project folder and install the necessary dependencies:
npm install

Then, initialize the database by generating the Prisma client and pushing the schema to your Neon database:
npx prisma generate
npx prisma db push

Finally, start the development server:
npm run dev

The application will now be running locally and can be accessed at http://localhost:3000 in your web browser.

Typical Application Workflow

Log In: Access the dashboard using authorized credentials.

Inject: Upload a reconciliation_report.json file to populate the database.

Reconcile: Run the discrepancy check to validate transaction volumes.

Audit: Query the AI agent for risk assessments based on the active batch.

Forecast and Tax: Utilize the Cash Forecaster and Tax modules for future planning and liability calculation.

License and Author
Developed and maintained by Aaditya Paul.
Submitted as a final project for the Fintech and AI / Full-Stack Software Development track.
