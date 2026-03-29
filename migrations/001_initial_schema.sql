-- RockstarData Marketing Ops — Initial Schema
-- Follows 03_TECH_SPEC.md exactly

-- Migration tracking
CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads entrantes (raw + procesados)
CREATE TABLE leads_intake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_payload JSONB NOT NULL,
    normalized JSONB,
    source VARCHAR(50) NOT NULL,
    campaign VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'raw',
    rejection_reason TEXT,
    dedup_result JSONB,
    pipedrive_person_id INTEGER,
    pipedrive_org_id INTEGER,
    pipedrive_lead_id VARCHAR(50),
    pipedrive_deal_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    payload_before JSONB,
    payload_after JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(10) DEFAULT 'normal',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    decided_by VARCHAR(100),
    decided_at TIMESTAMPTZ,
    notes TEXT,
    slack_message_ts VARCHAR(50),
    execution_result JSONB,
    -- Link to the entity that triggered this approval
    linked_lead_id UUID REFERENCES leads_intake(id),
    action_type VARCHAR(50)
);

-- Blacklist
CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    value VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type, value)
);

-- Logs de agentes
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    level VARCHAR(10) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    duration_ms INTEGER,
    cost_cents INTEGER
);

-- Campañas outbound
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icp_criteria JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    target_accounts INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_status ON leads_intake(status);
CREATE INDEX idx_leads_campaign ON leads_intake(campaign);
CREATE INDEX idx_leads_email ON leads_intake((normalized->>'email'));
CREATE INDEX idx_leads_domain ON leads_intake((normalized->>'domain'));
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_type ON approvals(type);
CREATE INDEX idx_logs_agent ON agent_logs(agent_name);
CREATE INDEX idx_logs_timestamp ON agent_logs(timestamp DESC);
CREATE INDEX idx_blacklist_type_value ON blacklist(type, value);
