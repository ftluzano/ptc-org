CREATE TABLE auth_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    role ENUM('president', 'cessca') NOT NULL,
    org_code VARCHAR(32) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_auth_users_email (email),
    UNIQUE KEY uq_auth_users_org_code (org_code),
    CONSTRAINT chk_auth_users_role_org CHECK (
        (role = 'president' AND org_code IS NOT NULL) OR
        (role = 'cessca' AND org_code IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
