-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "score" INTEGER DEFAULT 0,
    "stage" TEXT NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PipelineStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grokResponse" TEXT,
    "modelUsed" TEXT,
    "input" TEXT,
    "output" TEXT,
    "userTriggered" TEXT,
    CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelVariant" TEXT NOT NULL,
    "leadId" TEXT,
    "responseTime" REAL NOT NULL,
    "score" INTEGER,
    "scoreConsistency" REAL,
    "responseQuality" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScoringCriteria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "companySizeWeight" REAL NOT NULL DEFAULT 1.0,
    "industryMatchWeight" REAL NOT NULL DEFAULT 1.0,
    "budgetSignalsWeight" REAL NOT NULL DEFAULT 1.0,
    "decisionMakerWeight" REAL NOT NULL DEFAULT 1.0,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE INDEX "Lead_score_idx" ON "Lead"("score");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineStage_name_key" ON "PipelineStage"("name");

-- CreateIndex
CREATE INDEX "Activity_leadId_idx" ON "Activity"("leadId");

-- CreateIndex
CREATE INDEX "Activity_timestamp_idx" ON "Activity"("timestamp");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "EvaluationResult_modelVariant_idx" ON "EvaluationResult"("modelVariant");

-- CreateIndex
CREATE INDEX "EvaluationResult_createdAt_idx" ON "EvaluationResult"("createdAt");

-- CreateIndex
CREATE INDEX "ScoringCriteria_userId_idx" ON "ScoringCriteria"("userId");
