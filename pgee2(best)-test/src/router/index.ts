import { CommonService } from '@/services/CommonService'
import * as consty from '@/services/Const'
import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    roles?: string[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/IndexView.vue')
    },
    {
      path: '/register',
      component: () => import('@/views/login/RegisterView.vue')
    },
    {
      path: '/',
      component: () => import('@/views/main/IndexView.vue'),
      meta: {
        roles: [consty.ADMIN, consty.STUDENT, consty.COUNSELOR, consty.COLLEGE_ADMIN]
      },
      children: [
        {
          path: 'settings',
          component: () => import('@/views/main/UserSettingView.vue')
        },
        {
          path: 'admin',
          component: () => import('../views/main/admin/IndexView.vue'),
          meta: { roles: [consty.ADMIN] },
          children: [
            {
              path: 'colleges',
              component: () => import('../views/main/admin/CollegesView.vue')
            },
            {
              path: 'college-admins/:collegeId',
              component: () => import('../views/main/admin/CollegeAdminsView.vue')
            }
          ]
        },
        {
          path: 'student',
          component: () => import('@/views/main/student/IndexView.vue'),
          meta: {
            roles: [consty.STUDENT]
          },
          children: [
            {
              path: '',
              component: () => import('@/views/main/student/HomeView.vue')
            },
            {
              path: 'weightedscore',
              component: () => import('@/views/main/student/weightedscore/IndexView.vue')
            },
            {
              path: 'studentitems/:itemid',
              component: () => import('@/views/main/student/studentitems/IndexView.vue')
            }
          ]
        },
        {
          path: 'college',
          component: () => import('@/views/main/college/IndexView.vue'),
          meta: {
            roles: [consty.COUNSELOR, consty.COLLEGE_ADMIN]
          },
          children: [
            {
              path: '',
              component: () => import('@/views/main/college/HomeView.vue')
            },
            {
              // 类别管理跳转至专业管理
              path: 'categories/majors/:catid',
              component: () => import('@/views/main/college/functions/MajorsView.vue')
            },
            {
              path: 'functions',
              component: () => import('@/views/main/college/functions/IndexView.vue')
            },
            {
              path: 'categories/:catid',
              component: () => import('@/views/main/college/categories/IndexView.vue'),
              children: [
                {
                  path: 'marjors/:majorid',
                  component: () => import('@/views/main/college/majors/IndexView.vue')
                }
              ]
            }
          ]
        }
      ]
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

/* router.beforeEach(to => {
  if (!to.meta.roles) {
    return true
  }

  const role = to.meta.roles.find(r => r == CommonService.getRoleService())
  if (role) {
    return true
  }
  CommonService.clearLoginService()
  return false
}) */
/* router.beforeEach(async (to, from, next) => {
  // 1. 无需权限的路由（如/login、/register）直接放行
  if (!to.meta.roles) {
    return next()
  }

  // 2. 获取当前登录角色（兼容null/undefined）
  const currentRole = CommonService.getRoleService()
  if (!currentRole) {
    // 未登录 → 跳登录页
    CommonService.clearLoginService()
    return next('/login')
  }

  // 3. 角色匹配校验
  const hasPermission = to.meta.roles.some(role => role === currentRole)
  if (hasPermission) {
    // 有权限 → 放行
    return next()
  } else {
    // 无权限 → 清空登录态并跳登录
    CommonService.clearLoginService()
    return next('/login')
  }
}) */

router.beforeEach((to, from, next) => {
  if (!to.meta.roles) {
    return next()
  }

  const currentRole = CommonService.getRoleService()

  if (!currentRole) {
    sessionStorage.clear()
    return next('/login')
  }

  const hasPermission = to.meta.roles.some(role => role === currentRole)
  if (hasPermission) {
    next()
  } else {
    sessionStorage.clear()
    next('/login')
  }
})

export default router
