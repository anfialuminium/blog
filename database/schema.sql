-- טבלה עבור הפוסטים בבלוג
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- אפשור RLS (Row Level Security)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- מדיניות קריאה לכולם (ציבורי)
CREATE POLICY "Allow public read access" ON public.blog_posts
    FOR SELECT USING (true);

-- מדיניות ניהול (הוספה, עריכה, מחיקה) רק עבור משתמשים מאומתים או לפי הצורך
-- לצורך הפשטות בשלב זה, נאפשר הכל (יש לאבטח בהמשך עם API Key או Auth)
CREATE POLICY "Allow all for admin" ON public.blog_posts
    FOR ALL USING (true);
