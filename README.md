# 博物馆文物修复档案系统

一个完整的博物馆文物修复档案管理系统，包含文物档案管理、修复流程记录、照片对比、时间线展示等功能。

## 技术栈

### 后端
- **框架**: Spring Boot 3.2
- **数据库**: PostgreSQL
- **对象存储**: MinIO
- **认证**: JWT + Spring Security
- **ORM**: Spring Data JPA
- **构建工具**: Maven

### 前端
- **框架**: React 18
- **构建工具**: Vite 5
- **UI组件**: Ant Design 5
- **路由**: React Router 6
- **HTTP客户端**: Axios

## 功能特性

### 文物管理
- 文物档案的增删改查（仅管理员可编辑）
- 每件文物拥有唯一编号
- 记录文物基本信息：名称、年代、来源、材质、描述

### 修复记录管理
- 每件文物可关联多次修复记录
- 记录修复师、修复日期、使用材料、操作详情
- 支持修复前后照片上传对比
- 修复历史时间线展示

### 权限管理
- **管理员 (ADMIN)**: 查看所有记录、管理文物档案（增删改）
- **修复师 (RESTORER)**: 新建修复记录、查看所有记录

## 项目结构

```
a53/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/museum/relic/
│   │   ├── RelicRestorationApplication.java
│   │   ├── config/            # 配置类（安全、MinIO、数据初始化）
│   │   ├── controller/        # REST API 控制器
│   │   ├── dto/               # 数据传输对象
│   │   ├── entity/            # JPA 实体类
│   │   ├── repository/        # 数据访问层
│   │   ├── security/          # JWT 认证相关
│   │   └── service/           # 业务逻辑层
│   └── src/main/resources/
│       ├── application.yml    # 应用配置
│       └── schema.sql         # 数据库初始化脚本
└── frontend/                   # React 前端
    ├── src/
    │   ├── components/        # 通用组件
    │   ├── context/           # React Context（认证）
    │   ├── pages/             # 页面组件
    │   ├── utils/             # 工具函数（API封装）
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## 快速开始

### 环境要求
- JDK 17+
- Node.js 18+
- PostgreSQL 14+
- MinIO (可选，如未配置则照片通过后端代理访问)

### 后端启动

1. **创建数据库**
```sql
CREATE DATABASE museum_relic;
```

2. **修改配置**

编辑 `backend/src/main/resources/application.yml`，根据实际情况修改数据库和MinIO连接信息。

3. **启动后端**
```bash
cd backend
mvn spring-boot:run
```

后端启动后会自动创建表结构并初始化默认账号。

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 修复师 | restorer | restorer123 |
| 修复师 | restorer2 | restorer123 |

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录

### 文物接口
- `GET /api/relics` - 获取文物列表
- `GET /api/relics/{id}` - 根据ID获取文物
- `GET /api/relics/no/{relicNo}` - 根据编号获取文物
- `POST /api/relics` - 新增文物（ADMIN）
- `PUT /api/relics/{id}` - 更新文物（ADMIN）
- `DELETE /api/relics/{id}` - 删除文物（ADMIN）

### 修复记录接口
- `GET /api/restorations` - 获取所有修复记录
- `GET /api/restorations/{id}` - 根据ID获取修复记录
- `GET /api/restorations/relic/{relicId}` - 获取文物的修复历史
- `GET /api/restorations/relic-no/{relicNo}` - 根据文物编号获取修复历史
- `GET /api/restorations/restorer/{restorerId}` - 获取修复师的修复记录
- `POST /api/restorations` - 新增修复记录（RESTORER）

### 照片接口
- `POST /api/photos/upload` - 上传照片（RESTORER）
- `GET /api/photos/{objectName}` - 获取照片
- `GET /api/photos/url/{objectName}` - 获取照片访问URL
