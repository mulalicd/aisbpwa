
-- Industries table
CREATE TABLE public.industries (
  id SERIAL PRIMARY KEY,
  chapter_number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Industries are public" ON public.industries FOR SELECT USING (true);

-- Problems table
CREATE TABLE public.problems (
  id TEXT PRIMARY KEY, -- "1.1", "2.3" etc
  chapter_number INT NOT NULL REFERENCES public.industries(chapter_number),
  title TEXT NOT NULL,
  severity TEXT DEFAULT 'MEDIUM',
  confidence NUMERIC DEFAULT 8.0,
  promptability NUMERIC DEFAULT 8.0,
  budget TEXT,
  timeline TEXT,
  narrative_hook TEXT,
  sections JSONB DEFAULT '{}',
  prompt TEXT,
  failure_modes JSONB DEFAULT '[]',
  roi_data JSONB DEFAULT '{}',
  asmp_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems are public" ON public.problems FOR SELECT USING (true);

-- Chat conversations (no auth required for now)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat messages are public" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

-- Seed industries
INSERT INTO public.industries (chapter_number, name, slug, description, icon, color) VALUES
(1, 'Logistics & Supply Chain', 'logistics', 'Freight auditing, route optimization, warehouse management, and supply chain visibility.', 'Truck', '#F97316'),
(2, 'Education & EdTech', 'education', 'Adaptive learning, student engagement, curriculum design, and institutional analytics.', 'GraduationCap', '#3B82F6'),
(3, 'HR & Talent Management', 'hr', 'Recruitment automation, employee retention, skills mapping, and workforce planning.', 'Users', '#8B5CF6'),
(4, 'Manufacturing', 'manufacturing', 'Predictive maintenance, quality control, production scheduling, and lean operations.', 'Factory', '#EF4444'),
(5, 'Retail & E-Commerce', 'retail', 'Demand forecasting, pricing optimization, customer segmentation, and inventory management.', 'ShoppingCart', '#10B981'),
(6, 'Healthcare & Pharma', 'healthcare', 'Clinical decision support, drug discovery acceleration, patient flow optimization.', 'Heart', '#EC4899'),
(7, 'Finance & Banking', 'finance', 'Fraud detection, credit scoring, algorithmic trading, and regulatory compliance.', 'DollarSign', '#F59E0B'),
(8, 'Marketing & Sales', 'marketing', 'Lead scoring, content personalization, campaign optimization, and attribution modeling.', 'BarChart3', '#06B6D4'),
(9, 'IT & Digital Transformation', 'it', 'Cloud migration, cybersecurity automation, DevOps intelligence, and legacy modernization.', 'Monitor', '#6366F1'),
(10, 'Sustainability & NGO', 'sustainability', 'Carbon footprint tracking, ESG reporting, resource optimization, and impact measurement.', 'Leaf', '#22C55E');

-- Seed sample problems for each industry (5 per chapter = 50 total)
INSERT INTO public.problems (id, chapter_number, title, severity, confidence, promptability, budget, timeline, narrative_hook, prompt) VALUES
-- Chapter 1: Logistics
('1.1', 1, 'The Freight Leak (Automated Audit & Dispute)', 'HIGH', 9.2, 9.5, '$15K-$50K', '30 Days', 'Your AP team is currently spot-checking 10% of freight invoices. The other 90% sail through unchecked, carrying overcharges that compound into millions.', '<<< BEGIN PROMPT >>> You are a freight audit AI specialist. Analyze the following invoice data and identify discrepancies between contracted rates and billed amounts...<<< END PROMPT >>>'),
('1.2', 1, 'The Blind Warehouse (Inventory Visibility)', 'HIGH', 8.8, 9.0, '$20K-$80K', '45 Days', 'Your warehouse manager walks the floor with a clipboard. By the time the count is done, it''s already wrong.', '<<< BEGIN PROMPT >>> You are a warehouse optimization AI. Given the current inventory layout and movement patterns...<<< END PROMPT >>>'),
('1.3', 1, 'The Route Roulette (Dynamic Routing)', 'MEDIUM', 8.5, 8.7, '$10K-$40K', '60 Days', 'Every morning, your dispatch team rebuilds routes from scratch. They''re good, but they can''t process 47 variables simultaneously.', NULL),
('1.4', 1, 'The Supplier Gamble (Vendor Risk Scoring)', 'HIGH', 9.0, 9.2, '$25K-$100K', '90 Days', 'Your supplier evaluation is a spreadsheet updated quarterly. In 90 days, everything changes.', NULL),
('1.5', 1, 'The Demand Mirage (Forecasting Accuracy)', 'MEDIUM', 8.3, 8.5, '$15K-$60K', '45 Days', 'Your demand planning is based on last year''s numbers plus gut feeling. The market doesn''t care about your gut.', NULL),

-- Chapter 2: Education
('2.1', 2, 'The One-Size Classroom (Adaptive Learning Paths)', 'HIGH', 9.0, 9.3, '$20K-$70K', '60 Days', 'Every student gets the same lecture, same pace, same examples. Yet no two students learn the same way.', '<<< BEGIN PROMPT >>> You are an adaptive learning AI. Analyze student performance data and create personalized learning pathways...<<< END PROMPT >>>'),
('2.2', 2, 'The Dropout Signal (Early Warning Systems)', 'HIGH', 8.7, 9.0, '$15K-$50K', '30 Days', 'By the time you notice a student is failing, they''ve already mentally checked out weeks ago.', NULL),
('2.3', 2, 'The Assessment Bottleneck (Auto-Grading)', 'MEDIUM', 8.5, 8.8, '$10K-$30K', '30 Days', 'Your professors spend 40% of their time grading. That''s 40% not spent teaching, mentoring, or researching.', NULL),
('2.4', 2, 'The Curriculum Lag (Content Relevance)', 'MEDIUM', 8.2, 8.4, '$15K-$45K', '90 Days', 'Your curriculum was updated 3 years ago. The industry moved on 3 months ago.', NULL),
('2.5', 2, 'The Engagement Black Hole (Student Interaction)', 'LOW', 7.8, 8.0, '$5K-$20K', '30 Days', 'Online class. 200 students logged in. 15 have their cameras on. How many are actually present?', NULL),

-- Chapter 3: HR
('3.1', 3, 'The Resume Avalanche (Screening Automation)', 'HIGH', 9.1, 9.4, '$10K-$40K', '21 Days', 'Your recruiter received 847 applications for one position. They have time to read maybe 50.', '<<< BEGIN PROMPT >>> You are an HR screening AI. Evaluate candidate profiles against the following job requirements...<<< END PROMPT >>>'),
('3.2', 3, 'The Silent Quitter (Retention Prediction)', 'HIGH', 8.9, 9.1, '$20K-$60K', '45 Days', 'Your best engineer just resigned. You had no idea it was coming. Neither did their manager.', NULL),
('3.3', 3, 'The Skills Gap (Workforce Planning)', 'MEDIUM', 8.4, 8.6, '$15K-$50K', '60 Days', 'You know what skills you need today. You have no idea what skills you''ll need in 18 months.', NULL),
('3.4', 3, 'The Bias Blind Spot (Fair Hiring)', 'HIGH', 8.7, 8.9, '$10K-$35K', '30 Days', 'Your hiring process is "objective." Except the data shows otherwise.', NULL),
('3.5', 3, 'The Onboarding Maze (New Hire Integration)', 'LOW', 7.9, 8.2, '$5K-$25K', '30 Days', 'Day 1: Welcome! Here''s a 200-page handbook. Good luck finding anything useful.', NULL),

-- Chapter 4: Manufacturing
('4.1', 4, 'The Unplanned Stop (Predictive Maintenance)', 'HIGH', 9.3, 9.5, '$30K-$120K', '60 Days', 'Machine #7 just went down. It will cost $47,000 per hour until it''s fixed. Nobody saw it coming.', '<<< BEGIN PROMPT >>> You are a predictive maintenance AI. Analyze sensor data from manufacturing equipment to predict failures...<<< END PROMPT >>>'),
('4.2', 4, 'The Quality Escape (Defect Detection)', 'HIGH', 9.0, 9.2, '$25K-$80K', '45 Days', 'Your quality inspectors catch 94% of defects. The 6% they miss cost you 10x more downstream.', NULL),
('4.3', 4, 'The Scheduling Puzzle (Production Optimization)', 'MEDIUM', 8.6, 8.8, '$20K-$60K', '60 Days', 'Your production scheduler juggles 200 orders, 15 machines, and 47 constraints. They do it in Excel.', NULL),
('4.4', 4, 'The Energy Drain (Consumption Optimization)', 'MEDIUM', 8.3, 8.5, '$15K-$50K', '45 Days', 'Your energy bill is your third largest expense. You have no idea which processes are wasting power.', NULL),
('4.5', 4, 'The Supply Shock (Material Planning)', 'HIGH', 8.8, 9.0, '$20K-$70K', '60 Days', 'Your critical component has a 16-week lead time. You just found out you need it in 4 weeks.', NULL),

-- Chapter 5: Retail
('5.1', 5, 'The Empty Shelf (Demand Forecasting)', 'HIGH', 9.1, 9.3, '$15K-$60K', '30 Days', 'Your best-selling product is out of stock. Your worst-selling product has 6 months of inventory. Every. Single. Quarter.', '<<< BEGIN PROMPT >>> You are a retail demand forecasting AI. Analyze sales patterns, seasonality, and external factors...<<< END PROMPT >>>'),
('5.2', 5, 'The Price Paradox (Dynamic Pricing)', 'HIGH', 8.9, 9.1, '$20K-$80K', '45 Days', 'Your competitor changed their price 47 times today. You changed yours once, last Tuesday.', NULL),
('5.3', 5, 'The Anonymous Shopper (Customer Segmentation)', 'MEDIUM', 8.5, 8.7, '$10K-$40K', '30 Days', 'You have 2 million customers. You treat them as 3 segments. The math doesn''t work.', NULL),
('5.4', 5, 'The Return Tsunami (Reverse Logistics)', 'MEDIUM', 8.3, 8.5, '$15K-$50K', '45 Days', '30% of online orders get returned. Processing each one costs $15-$25. Do the math.', NULL),
('5.5', 5, 'The Basket Mystery (Cross-Sell Optimization)', 'LOW', 8.0, 8.3, '$10K-$30K', '30 Days', 'Customers who buy X also buy Y. You know this. You just don''t act on it at scale.', NULL),

-- Chapter 6: Healthcare
('6.1', 6, 'The Diagnostic Delay (Clinical Decision Support)', 'HIGH', 9.4, 9.5, '$50K-$200K', '90 Days', 'The average diagnostic error rate is 12%. For rare conditions, it''s closer to 30%. Lives hang in the balance.', '<<< BEGIN PROMPT >>> You are a clinical decision support AI. Given patient symptoms, lab results, and medical history...<<< END PROMPT >>>'),
('6.2', 6, 'The Drug Pipeline (Discovery Acceleration)', 'HIGH', 9.2, 9.0, '$100K-$500K', '180 Days', 'Bringing a drug to market takes 12 years and $2.6 billion. AI can cut both in half.', NULL),
('6.3', 6, 'The Waiting Room (Patient Flow Optimization)', 'MEDIUM', 8.6, 8.8, '$20K-$70K', '45 Days', 'Your ER wait time averages 4.2 hours. Your patients don''t have 4.2 hours.', NULL),
('6.4', 6, 'The Paper Chase (Medical Records)', 'MEDIUM', 8.4, 8.6, '$15K-$50K', '60 Days', 'A doctor spends 2 hours on paperwork for every 1 hour with patients. Something is deeply wrong.', NULL),
('6.5', 6, 'The Readmission Cycle (Post-Discharge Prediction)', 'HIGH', 8.8, 9.0, '$25K-$80K', '45 Days', '18% of Medicare patients are readmitted within 30 days. Each one costs $15,000+.', NULL),

-- Chapter 7: Finance
('7.1', 7, 'The Fraud Shadow (Real-Time Detection)', 'HIGH', 9.5, 9.5, '$30K-$150K', '45 Days', '$32 billion lost to fraud annually. Your rule-based system catches patterns from 2019. Fraudsters evolved yesterday.', '<<< BEGIN PROMPT >>> You are a fraud detection AI. Analyze transaction patterns in real-time to identify anomalous behavior...<<< END PROMPT >>>'),
('7.2', 7, 'The Credit Gamble (Risk Assessment)', 'HIGH', 9.1, 9.3, '$25K-$100K', '60 Days', 'Your credit model says "no" to 30% of applicants. How many were actually good risks?', NULL),
('7.3', 7, 'The Compliance Maze (Regulatory Automation)', 'MEDIUM', 8.7, 8.9, '$20K-$80K', '90 Days', '15,000 regulatory changes per year. Your compliance team has 12 people. You do the math.', NULL),
('7.4', 7, 'The Market Whisper (Sentiment Analysis)', 'MEDIUM', 8.4, 8.6, '$15K-$60K', '30 Days', 'By the time your analyst reads the earnings call transcript, the market has already moved.', NULL),
('7.5', 7, 'The Churn Cliff (Customer Retention)', 'HIGH', 8.9, 9.1, '$20K-$70K', '45 Days', 'Acquiring a customer costs 5x more than keeping one. Yet you spend 80% of budget on acquisition.', NULL),

-- Chapter 8: Marketing
('8.1', 8, 'The Lead Labyrinth (Scoring & Qualification)', 'HIGH', 9.0, 9.3, '$10K-$50K', '30 Days', 'Your sales team is calling 500 leads. 12 will convert. They have no idea which 12.', '<<< BEGIN PROMPT >>> You are a lead scoring AI. Analyze prospect behavior signals, firmographics, and engagement patterns...<<< END PROMPT >>>'),
('8.2', 8, 'The Content Void (Personalization at Scale)', 'HIGH', 8.8, 9.0, '$15K-$60K', '45 Days', 'You need 47 content variations for your next campaign. Your team can produce 5. Per month.', NULL),
('8.3', 8, 'The Attribution Fog (ROI Measurement)', 'MEDIUM', 8.5, 8.7, '$10K-$40K', '30 Days', 'The customer touched 14 channels before buying. Which one gets credit? Your CFO wants to know.', NULL),
('8.4', 8, 'The Campaign Roulette (A/B Testing)', 'MEDIUM', 8.3, 8.5, '$5K-$25K', '21 Days', 'You test 2 versions. You should be testing 200. The math of optimization demands it.', NULL),
('8.5', 8, 'The Social Echo (Brand Monitoring)', 'LOW', 8.0, 8.2, '$5K-$20K', '14 Days', 'Someone tweeted about your brand 3 hours ago. It has 10,000 retweets. You just found out.', NULL),

-- Chapter 9: IT
('9.1', 9, 'The Migration Minefield (Cloud Transition)', 'HIGH', 9.1, 9.3, '$30K-$150K', '90 Days', 'Your cloud migration is 6 months behind schedule and 40% over budget. Sound familiar?', '<<< BEGIN PROMPT >>> You are a cloud migration AI strategist. Analyze the current infrastructure, dependencies, and risk factors...<<< END PROMPT >>>'),
('9.2', 9, 'The Security Blind Spot (Threat Detection)', 'HIGH', 9.3, 9.5, '$25K-$120K', '30 Days', 'Your SOC team reviews 10,000 alerts per day. 9,985 are false positives. But which 15 are real?', NULL),
('9.3', 9, 'The Legacy Anchor (Modernization)', 'MEDIUM', 8.6, 8.8, '$40K-$200K', '180 Days', 'Your core system was built in 2003. It works. Barely. And nobody who wrote it still works here.', NULL),
('9.4', 9, 'The Incident Spiral (Auto-Resolution)', 'MEDIUM', 8.4, 8.6, '$15K-$50K', '45 Days', 'Ticket #47832: "System is slow." Resolution: "Have you tried restarting?" This happens 200 times a day.', NULL),
('9.5', 9, 'The Code Debt (Technical Debt Management)', 'HIGH', 8.8, 9.0, '$20K-$80K', '60 Days', 'Your codebase has 2,847 known issues. Every sprint adds 12 more and fixes 8. The math is terrifying.', NULL),

-- Chapter 10: Sustainability
('10.1', 10, 'The Carbon Blindfold (Footprint Tracking)', 'HIGH', 9.0, 9.2, '$20K-$80K', '60 Days', 'Your ESG report is due in 90 days. Your Scope 3 emissions data is scattered across 47 suppliers.', '<<< BEGIN PROMPT >>> You are a carbon footprint analysis AI. Calculate and track greenhouse gas emissions across all scopes...<<< END PROMPT >>>'),
('10.2', 10, 'The Greenwash Trap (ESG Reporting)', 'HIGH', 8.8, 9.0, '$15K-$60K', '45 Days', 'Your sustainability report looks great. But can it survive an audit? The new regulations say it must.', NULL),
('10.3', 10, 'The Resource Drain (Optimization)', 'MEDIUM', 8.5, 8.7, '$10K-$40K', '30 Days', 'You''re using 30% more water, energy, and materials than necessary. You just don''t know where.', NULL),
('10.4', 10, 'The Impact Illusion (Measurement)', 'MEDIUM', 8.3, 8.5, '$10K-$35K', '45 Days', 'Your NGO served 50,000 people last year. But what actually changed? The donors want to know.', NULL),
('10.5', 10, 'The Supply Chain Shadow (Ethical Sourcing)', 'HIGH', 8.7, 8.9, '$20K-$70K', '90 Days', 'Your Tier 1 suppliers look clean. But what about Tier 2? Tier 3? You don''t even know who they are.', NULL);
