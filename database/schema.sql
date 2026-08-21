CREATE DATABASE IF NOT EXISTS vita_guia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vita_guia;

CREATE TABLE IF NOT EXISTS advisors (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  contact VARCHAR(190) NOT NULL DEFAULT '',
  token VARCHAR(96) NOT NULL UNIQUE,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS access_links (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(96) NOT NULL UNIQUE,
  advisor_id INT UNSIGNED NULL,
  recipient_name VARCHAR(160) NOT NULL,
  recipient_contact VARCHAR(190) NOT NULL DEFAULT '',
  expires_at VARCHAR(35) NOT NULL,
  max_opens INT UNSIGNED NULL,
  open_count INT UNSIGNED NOT NULL DEFAULT 0,
  first_opened_at VARCHAR(35) NULL,
  last_opened_at VARCHAR(35) NULL,
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  created_by VARCHAR(190) NOT NULL DEFAULT 'local-admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_access_links_expires_at (expires_at),
  INDEX idx_access_links_advisor_id (advisor_id),
  CONSTRAINT fk_access_links_advisor FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
