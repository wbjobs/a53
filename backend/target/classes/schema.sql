-- 博物馆文物修复档案系统 - 数据库初始化脚本
-- PostgreSQL

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('RESTORER', 'ADMIN')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 文物表
CREATE TABLE IF NOT EXISTS relics (
    id SERIAL PRIMARY KEY,
    relic_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    era VARCHAR(100),
    source VARCHAR(200),
    material VARCHAR(100),
    description TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 修复记录表
CREATE TABLE IF NOT EXISTS restoration_records (
    id SERIAL PRIMARY KEY,
    relic_id BIGINT NOT NULL REFERENCES relics(id) ON DELETE CASCADE,
    restorer_id BIGINT NOT NULL REFERENCES users(id),
    restoration_date DATE NOT NULL,
    materials TEXT,
    operations TEXT NOT NULL,
    before_photo_path VARCHAR(500),
    after_photo_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 基础索引
CREATE INDEX IF NOT EXISTS idx_relics_relic_no ON relics(relic_no);

-- 复合索引：按文物查询修复记录并按日期排序（最频繁的查询场景）
CREATE INDEX IF NOT EXISTS idx_restorations_relic_date
    ON restoration_records(relic_id, restoration_date DESC);

-- 复合索引：按修复师查询修复记录并按日期排序
CREATE INDEX IF NOT EXISTS idx_restorations_restorer_date
    ON restoration_records(restorer_id, restoration_date DESC);

-- 全表按日期排序查询的索引
CREATE INDEX IF NOT EXISTS idx_restorations_date_desc
    ON restoration_records(restoration_date DESC);

-- 单列索引（兼容旧查询）
CREATE INDEX IF NOT EXISTS idx_restorations_relic_id ON restoration_records(relic_id);
CREATE INDEX IF NOT EXISTS idx_restorations_restorer_id ON restoration_records(restorer_id);
