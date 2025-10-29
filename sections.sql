-- 创建首页板块表
CREATE TABLE IF NOT EXISTS home_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(50) NOT NULL UNIQUE COMMENT '板块唯一标识',
    section_name VARCHAR(50) NOT NULL COMMENT '板块名称',
    section_desc VARCHAR(200) DEFAULT '' COMMENT '板块描述',
    section_icon VARCHAR(10) DEFAULT '📚' COMMENT '板块图标',
    navigate_url VARCHAR(200) NOT NULL COMMENT '跳转链接',
    badge_type VARCHAR(20) DEFAULT '' COMMENT '徽章类型',
    badge_text VARCHAR(20) DEFAULT '' COMMENT '徽章文本',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用(1:启用,0:禁用)',
    is_disabled TINYINT DEFAULT 0 COMMENT '是否禁用(1:禁用,0:可用)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入六大板块数据
INSERT INTO home_sections (section_key, section_name, section_desc, section_icon, navigate_url, badge_type, badge_text, is_enabled, is_disabled)
VALUES
('covers', '封面素材', '海量高清书籍封面', '📖', '/pages/covers/index', 'recommend', '推荐', 1, 0),
('templates', '视频模板', '热门书单视频模板', '🎬', '/pages/templates/index', 'hot', '热门', 1, 0),
('watermark', '去水印', '智能去除视频水印', '💧', '/pages/watermark/index', 'coming-soon', '即将上线', 1, 1),
('text_extract', '文案提取', '智能提取视频文案', '📝', '/pages/text-extract/index', 'coming-soon', '即将上线', 1, 1),
('hot_materials', '热门素材', '丰富的剪辑素材库', '🎨', '/pages/hot-materials/index', 'coming-soon', '即将上线', 1, 1),
('fonts', '推荐字体', '精选书单专用字体', '🔤', '/pages/fonts/index', 'coming-soon', '即将上线', 1, 1);

-- 可选：创建索引以提高查询性能
CREATE INDEX idx_section_key ON home_sections(section_key);
CREATE INDEX idx_is_enabled ON home_sections(is_enabled);