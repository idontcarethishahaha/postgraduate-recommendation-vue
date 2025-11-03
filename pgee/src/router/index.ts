import * as consty from '@/services/Const'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

//角色权限
declare module 'vue-router' {
  interface RouteMeta {
    roles?: string[]
  }
}

const routes: RouteRecordRaw[] = [
  //公开路由
  {
    path: '/login',
    component: () => import('@/views/login/IndexView.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/login/RegisterView.vue')
  },

  //系统主入口（所有角色的父路由）
  {
    path: '/',
    component: () => import('@/views/main/IndexView.vue'),
    meta: { roles: [consty.ADMIN, consty.COLLEGE_ADMIN, consty.COUNSELOR, consty.STUDENT] },
    children: [
      // 管理员模块
      {
        path: 'admin',
        component: () => import('@/views/main/admin/IndexView.vue'),
        meta: { roles: [consty.ADMIN] },
        children: [
          {
            path: 'colleges',
            component: () => import('@/views/main/admin/CollegesView.vue')
          },
          // 关键修改：添加动态路径参数 :collegeId 和 :collegeName
          {
            path: 'college-admins/:collegeId/:collegeName',
            component: () => import('@/views/main/admin/CollegeAdminsView.vue')
          }
        ]
      },

      // 学院管理员模块
      {
        path: 'collegeadmin',
        component: () => import('@/views/main/collegeadmin/IndexView.vue'),
        meta: { roles: [consty.COLLEGE_ADMIN] }
      },

      // 辅导员模块
      {
        path: 'counselor',
        component: () => import('@/views/main/counselor/IndexView.vue'),
        meta: { roles: [consty.COUNSELOR] }
      },

      // 学生模块
      {
        path: 'student',
        component: () => import('@/views/main/student/IndexView.vue'),
        meta: { roles: [consty.STUDENT] }
      }

      // 公共设置页
      /* {
        path: 'settings',
        component: () => import('@/views/main/UserSettingView.vue')
      }*/
    ]
  }

  // 404路由
  // {
  //   path: '/:pathMatch(.*)*',
  //   redirect: '/login'
  // }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

//权限校验
router.beforeEach(to => {
  //无需权限的路由（登录/注册）
  console.log(to.fullPath)

  if (!to.meta.roles) {
    console.log('to.meta.roles')

    return true
  }

  const role = sessionStorage.getItem('role')
  console.log(role)

  const rolex = to.meta.roles.find(r => r == sessionStorage.getItem('role'))
  if (rolex) {
    return true
  }
  sessionStorage.clear()
  return '/login'
})

export default router
