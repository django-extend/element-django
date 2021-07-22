<template>
  <el-form
    ref="ruleForm"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item :label="label" prop="password">
      <el-input v-model="form.password" show-password />
    </el-form-item>
    <el-form-item prop="checkPassword">
      <span slot="label">
        {{ label }} (重复)
      </span>
      <el-input v-model="form.checkPassword" show-password />
    </el-form-item>
  </el-form>
</template>
<script>
import * as resource from '@/components/Django/api/resource'
export default {
  props: {
    field: {
      type: Object,
      required: true
    },
    sourceKey: {
      type: String,
      default: ''
    }
  },
  data() {
    const checkPassword = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error('密码输入不一致'))
      } else {
        callback()
      }
    }
    return {
      form: {
        password: '',
        checkPassword: ''
      },
      rules: {
        password: [{ required: true, message: '请输入', trigger: 'blur' }],
        checkPassword: [
          { required: true, message: '请输入', trigger: 'blur' },
          { validator: checkPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    label: {
      get() {
        return this.field.meta ? this.field.meta.label : ''
      }
    }
  },
  methods: {
    resetForm() {
      this.$refs.ruleForm.resetFields()
    },
    submit() {
      return new Promise((resolve, reject) => {
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            const [app, model] = this.$route.name.split('.')
            const params = {}
            params[`${this.field.key}`] = this.form.password
            resource.update(app, model, this.sourceKey, params).then(res => {
              this.$message.success('更新成功')
              resolve()
            }).catch(() => {
              reject()
            })
          } else {
            reject()
          }
        })
      })
    }
  }
}
</script>
