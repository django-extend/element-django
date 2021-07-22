[English](./README.md) | 简体中文

<h1 align="center">Element-Django</h1>
<div align="center">
Django Admin 的前端框架. 使用<a href="https://element.eleme.cn/" target="_blank">Element</a>书写
</div>

### 后端依赖

> 后端依赖 <a href="https://github.com/django-extend/django-admin-api.git">django-admin-api</a>.
> 
> 需要先按照`django-admin-api`的向导建立一个后端项目（假设后端服务已经成功运行在http://localhost:8000）

### 前端项目安装

- 克隆仓库
```bash
git clone https://github.com/django-extend/element-django.git my-project
cd my-project
```

github不稳定的话，国内可使用码云仓库
```
git clone https://gitee.com/django-extend/element-django.git my-project
```

- 安装依赖

```
npm install --registry=https://registry.npm.taobao.org
```

也可尝试使用cnpm安装
```
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install
```

- 编译并运行（开发环境）
```
npm run dev
```
