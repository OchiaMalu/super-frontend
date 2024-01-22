## 速配管理后台

<img src="https://gitee.com/ochiamaluo/my-img/raw/master/picgo/1.jpg" alt="1" style="zoom: 50%;margin:0 auto" />

## 项目介绍

本项目使用 **Vite+Vue3+Element-Plus** ，作为 **速配（SUPER）** 用户匹配系统的后台管理系统。

本项目非必须，主要功能在 `super-backend` 及 `super-frontend-web` 中已经实现。

仅管理员账号可以登录本系统，管理员可以将普通用户升级为管理员，但 **第一个** 管理员只能进入数据库修改，将需要成为管理员的用户  `role` 改为 `1` 即可，如下图所示。

<img src="https://gitee.com/ochiamaluo/my-img/raw/master/picgo/2.jpg" alt="3" style="zoom:80%;margin:0 auto" />

<u>在启动本项目前应先启动项目本体的后端。</u>

## 项目功能

在使用管理员账号登录后跳转至首页。

<img src="https://gitee.com/ochiamaluo/my-img/raw/master/picgo/3.jpg" alt="3" style="zoom: 50%;margin:0 auto" />

在用户管理页可查看所有用户的信息，也可以执行新增用户、封禁用户等操作。

<img src="https://gitee.com/ochiamaluo/my-img/raw/master/picgo/4.jpg" alt="4" style="zoom:50%;margin:0 auto" />
