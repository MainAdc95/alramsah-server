CREATE DATABASE alramsah;
\c alramsah

CREATE TABLE IF NOT EXISTS user_images (
    image_id uuid PRIMARY KEY NOT NULL,
    image_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO user_images (
    image_id,
    image_name    
) VALUES ('e5daee20-3122-4481-9898-4682624fae09', 'prof.png');

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
    last_logged_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_order SERIAL NOT NULL,
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_editor BOOLEAN NOT NULL DEFAULT FALSE,
    is_reporter BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by uuid REFERENCES users(user_id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS user_images
    ADD COLUMN user_id uuid
    REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS images (
    image_id uuid PRIMARY KEY,
    image_name TEXT NOT NULL UNIQUE,
    image_description TEXT,
    created_by uuid NOT NULL REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    section_id uuid PRIMARY KEY,
    section_name TEXT NOT NULL,
    color VARCHAR(255),
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    tag_id uuid PRIMARY KEY,
    tag_name TEXT NOT NULL,
    tag_order SERIAL NOT NULL,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
    news_id uuid PRIMARY KEY,
    intro TEXT NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    sub_titles JSONB NULL,
    section uuid REFERENCES sections(section_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    is_published BOOLEAN DEFAULT FALSE,
    news_order SERIAL NOT NULL,
    readers INT NOT NULL,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS messages (
    message_id uuid PRIMARY KEY,
    subject TEXT NOT NULL,
    text TEXT NOT NULL,
    to_user uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    is_viewed BOOLEAN DEFAULT FALSE,
    message_order SERIAL NOT NULL,
    created_by uuid REFERENCES users(user_id) ON DELETE NO ACTION ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT privacy_policy_id CHECK (privacy_policy_id)
);

INSERT INTO privacy_policy (
    text
) VALUES ('');