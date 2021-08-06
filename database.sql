CREATE DATABASE alramsah;
\c alramsah

CREATE TABLE IF NOT EXISTS user_images (
    image_id uuid PRIMARY KEY NOT NULL,
    sizes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_images DROP COLUMN image_name;
ALTER TABLE user_images ADD sizes JSONB;

INSERT INTO user_images (
    image_id,
    sizes
) VALUES ('2d06f735-f13c-4142-803b-6834648fed2d', '{ "s": "prof.png", "m": "prof.png", "l": "prof.png"}');

CREATE TABLE IF NOT EXISTS users (
    user_id uuid PRIMARY KEY,
    avatar uuid REFERENCES user_images(image_id) ON UPDATE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL,
    version INT,
    password VARCHAR(255) NOT NULL,
    last_logged_in TIMESTAMPTZ DEFAULT NOW(),
    user_order SERIAL NOT NULL,
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_editor BOOLEAN NOT NULL DEFAULT FALSE,
    is_reporter BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin_assistant BOOLEAN DEFAULT FALSE,
    is_writer BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by uuid REFERENCES users(user_id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALTER TABLE users ADD is_admin_assistant BOOLEAN DEFAULT FALSE;
-- ALTER TABLE users ADD is_writer BOOLEAN DEFAULT FALSE;

ALTER TABLE IF EXISTS user_images
    ADD COLUMN user_id uuid
    REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS images (
    image_id uuid PRIMARY KEY,
    sizes JSONB,
    image_description TEXT,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALTER TABLE images ADD sizes JSONB;
-- ALTER TABLE images DROP COLUMN image_name;

CREATE TABLE IF NOT EXISTS files (
    file_id uuid PRIMARY KEY,
    text TEXT NOT NULL,
    image_id uuid REFERENCES images(image_id) ON UPDATE CASCADE,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    section_id uuid PRIMARY KEY,
    section_name TEXT NOT NULL,
    color VARCHAR(255),
    section_order SERIAL NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPDATE sections SET section_order=1 WHERE section_name='سياسة';
-- UPDATE sections SET section_order=2 WHERE section_name='اقتصاد';
-- UPDATE sections SET section_order=3 WHERE section_name='ثقافة';
-- UPDATE sections SET section_order=4 WHERE section_name='رياضة';
-- UPDATE sections SET section_order=5 WHERE section_name='تكنولوجيا';
-- UPDATE sections SET section_order=6 WHERE section_name='منوعات';
-- UPDATE sections SET section_order=7 WHERE section_name='سياحة';
-- UPDATE sections SET section_order=8 WHERE section_name='صحة';
-- UPDATE sections SET section_order=9 WHERE section_name='كتاب وآراء';

CREATE TABLE IF NOT EXISTS tags (
    tag_id uuid PRIMARY KEY,
    tag_name TEXT NOT NULL,
    tag_order SERIAL NOT NULL,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
    article_id uuid PRIMARY KEY,
    thumbnail uuid REFERENCES images(image_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    intro TEXT,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    sub_titles JSONB NULL,
    section uuid REFERENCES sections(section_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    is_published BOOLEAN DEFAULT FALSE,
    readers INT DEFAULT 0,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() 
);

alter table articles drop column section;

-- alter table articles drop column readers;
-- ALTER TABLE articles ADD readers INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS article_image (
    article_id uuid NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE ON UPDATE CASCADE,
    image_id uuid NOT NULL REFERENCES images(image_id) ON UPDATE CASCADE,
    CONSTRAINT article_image_pkey PRIMARY KEY (article_id, image_id)
);

CREATE TABLE IF NOT EXISTS article_tag (
    article_id uuid NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE ON UPDATE CASCADE,
    tag_id uuid NOT NULL REFERENCES tags(tag_id) ON UPDATE CASCADE,
    CONSTRAINT article_tag_pkey PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS news (
    news_id uuid PRIMARY KEY,
    thumbnail uuid REFERENCES images(image_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    intro TEXT,
    title TEXT,
    text TEXT,
    sub_titles JSONB,
    resources JSONB,
    section uuid REFERENCES sections(section_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    readers INT DEFAULT 0,
    thumbnail_description TEXT,
    file uuid REFERENCES files(file_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    published_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALTER TABLE news ADD published_at TIMESTAMPTZ;

-- alter table news add thumbnail_description TEXT;

-- alter table news drop column readers;
-- ALTER TABLE news ADD readers INT DEFAULT 0;

ALTER TABLE news ADD resources JSONB;


-- ALTER TABLE news ALTER column intro TEXT drop not null;
-- ALTER TABLE news ALTER column title TEXT drop not null;
-- ALTER TABLE news ALTER column text TEXT drop not null;

CREATE TABLE IF NOT EXISTS news_image (
    news_id uuid NOT NULL REFERENCES news(news_id) ON DELETE CASCADE ON UPDATE CASCADE,
    image_id uuid NOT NULL REFERENCES images(image_id) ON UPDATE CASCADE,
    CONSTRAINT news_image_pkey PRIMARY KEY (news_id, image_id)
);

CREATE TABLE IF NOT EXISTS news_tag (
    news_id uuid NOT NULL REFERENCES news(news_id) ON DELETE CASCADE ON UPDATE CASCADE,
    tag_id uuid NOT NULL REFERENCES tags(tag_id) ON UPDATE CASCADE,
    CONSTRAINT news_tag_pkey PRIMARY KEY (news_id, tag_id)
);

CREATE TABLE IF NOT EXISTS strips (
    strip_id uuid PRIMARY KEY,
    title TEXT NOT NULL,
    link TEXT,
    duration VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    message_id uuid PRIMARY KEY,
    subject TEXT NOT NULL,
    text TEXT NOT NULL,
    to_user uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    is_viewed BOOLEAN DEFAULT FALSE,
    message_order SERIAL NOT NULL,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_image (
    message_id uuid NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE ON UPDATE CASCADE,
    image_id uuid NOT NULL REFERENCES images(image_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT message_image_pkey PRIMARY KEY (message_id, image_id)
);

CREATE TABLE IF NOT EXISTS privacy_policy (
    privacy_policy_id BOOLEAN PRIMARY KEY DEFAULT TRUE,
    text TEXT NOT NULL,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT privacy_policy_id CHECK (privacy_policy_id)
);

INSERT INTO privacy_policy (
    text
) VALUES ('');

CREATE TABLE polls (
    poll_id uuid PRIMARY KEY,
    title TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE poll_options (
    option_id uuid PRIMARY KEY,
    name TEXT NOT NULL,
    votes INT,
    poll_id uuid REFERENCES polls(poll_id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_letter (
    news_letter_id uuid PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitors (
    visitor_id uuid PRIMARY KEY,
    user_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SELECT con.*
--        FROM pg_catalog.pg_constraint con
--             INNER JOIN pg_catalog.pg_class rel
--                        ON rel.oid = con.conrelid
--             INNER JOIN pg_catalog.pg_namespace nsp
--                        ON nsp.oid = connamespace
--              AND rel.relname = 'news';