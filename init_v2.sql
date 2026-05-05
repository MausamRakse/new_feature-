CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS agent_configs_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT,
    business_type TEXT,
    business_size TEXT,
    website_url TEXT,
    target_audience TEXT,
    agent_type TEXT,
    primary_goal TEXT,
    tone TEXT,
    language TEXT,
    response_style TEXT,
    conversation_rules TEXT,
    restricted_topics TEXT,
    escalation_condition TEXT,
    product_details TEXT,
    faqs TEXT,
    custom_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
