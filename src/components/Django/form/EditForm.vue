<template>
  <el-form
    ref="ruleForm"
    v-loading="loading"
    :model="source"
    label-width="100px"
  >
    <div v-for="fieldset in fieldsets" :key="fieldset[0]">
      <el-divider v-if="fieldset[0]" content-position="left">{{ fieldset[0] }}</el-divider>
      <el-form-item
        v-for="key in fieldset[1].fields"
        :key="key"
        :prop="'items.' + source.maps[key].index + '.value'"
        :rules="source.maps[key].rules"
        :validate-status="source.maps[key].validateStatus"
        :error="source.maps[key].error"
      >
        <span slot="label">
          {{ source.maps[key].meta.label }}
        </span>
        <el-button v-if="editMode && source.maps[key].meta.input_type==='password'" @click="handleChangePassword(source.maps[key])">修改</el-button>
        <django-field v-else v-model="source.items[source.maps[key].index].value" :meta="source.maps[key].meta" />
      </el-form-item>
    </div>
    <change-password-dialog
      :visible="changePasswordVisible"
      :field="changePasswordSource"
      :source-key="sourceKey"
      @close="changePasswordVisible=false"
    />
  </el-form>
</template>
<script>
import * as resource from '@/components/Django/api/resource'
import DjangoField from '@/components/Django/fields/DjangoField'
import ChangePasswordDialog from '@/components/Django/form/ChangePasswordDialog'

export default {
  components: { DjangoField, ChangePasswordDialog },
  props: {
    visible: Boolean,
    editMode: Boolean,
    sourceKey: {
      type: String,
      default: ''
    },
    metaInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fieldsets: [],
      source: {
        maps: {},
        items: [
        ]
      },
      loading: false,
      changePasswordVisible: false,
      changePasswordSource: {}
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.bind()
      }
    }
  },
  created() {
    this.bind()
  },
  methods: {
    buildParams() {
      let params
      if (this.haveFile(this.source.items)) {
        params = new FormData()
      } else {
        params = {}
      }
      return params
    },
    appendParam(params, key, value) {
      if (value === undefined || value === null) {
        // undefined是新增模式，null是编辑模式服务端返回
        return
      }
      if (params instanceof FormData) {
        if (Array.isArray(value)) {
          params.append(`${key}[]`, value)
        } else {
          params.append(key, value)
        }
      } else {
        params[key] = value
      }
    },
    isFileTypeField(item) {
      const fileTypeFields = ['file upload', 'image upload']
      return fileTypeFields.indexOf(item.meta.type) >= 0
    },
    isFile(val) {
      return val ? val.raw !== undefined : false
    },
    haveFile(items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (this.isFile(item.value)) {
          return true
        }
      }
      return false
    },
    resetData() {
      this.source.items = []
      this.source.maps = {}
      this.fieldsets = []
    },
    makeRules(meta) {
      if (this.editMode && meta.input_type === 'password') {
        return []
      }
      if (!meta.required) {
        return []
      }
      return [{ required: true, message: '请输入', trigger: 'blur' }]
    },
    insertItem(key, meta) {
      const item = {
        key: key,
        meta: meta,
        validateStatus: '',
        error: '',
        index: this.source.items.length,
        rules: this.makeRules(meta),
        value: undefined
      }
      this.source.items.push(item)
      this.source.maps[item.key] = item
      return item
    },
    bind() {
      const fieldInfos = this.metaInfo.actions.POST
      Object.keys(fieldInfos).forEach(key => {
        if (key === 'pk') { return true }
        const meta = fieldInfos[key]
        if (meta.read_only) { return true }
        this.insertItem(key, meta)
      })
      if (this.editMode) {
        this.fieldsets = this.metaInfo.fieldsets
      } else {
        let sourceFieldsets = this.metaInfo.addFieldsets
        if (sourceFieldsets.length === 0) {
          sourceFieldsets = this.metaInfo.fieldsets
        }
        const fieldsets = []
        sourceFieldsets.forEach(item => {
          const fields = []
          item[1].fields.forEach(name => {
            fields.push(name)
            const fieldItem = this.source.maps[name]
            if (fieldItem.meta.input_type === 'password') {
              const key = `_check_${fieldItem.key}`
              const meta = Object.assign({}, fieldItem.meta)
              meta.label = `${meta.label}(重复)`
              const checkItem = this.insertItem(key, meta)
              const func = (rule, value, callback) => {
                const dst = fieldItem.value
                if (value !== dst) {
                  callback(new Error('密码输入不一致'))
                } else {
                  callback()
                }
              }
              checkItem.rules.push({ validator: func, trigger: 'blur' })
              fields.push(key)
            }
          })
          fieldsets.push([item[0], { fields: fields }])
        })
        this.fieldsets = fieldsets
      }
      if (this.editMode) {
        const vm = this
        vm.loading = true
        const [app, model] = this.$route.name.split('.')
        resource.get(app, model, vm.sourceKey).then(res => {
          Object.keys(res).forEach(key => {
            const item = this.source.maps[key]
            item && (item.value = res[key])
          })
        }).finally(() => {
          vm.loading = false
        })
      } else {
        this.source.items.forEach(item => {
          item.value = undefined
        })
      }
    },
    echoError(err) {
      if (err.response) {
        const data = err.response.data
        if (Array.isArray(data)) {
          data.forEach(item => {
            this.$message.error(item)
          })
          return
        }
        for (const key in data) {
          const item = this.source.maps[key]
          item.validateStatus = 'error'
          item.error = err.response.data[key][0]
        }
      }
    },
    handleChangePassword(source) {
      this.changePasswordSource = source
      this.changePasswordVisible = true
    },
    resetForm() {
      this.$refs.ruleForm.resetFields()
    },
    submit() {
      return new Promise((resolve, reject) => {
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            const [app, model] = this.$route.name.split('.')
            const vm = this
            const params = this.buildParams()
            this.source.items.forEach(item => {
              item.validateStatus = ''
              item.error = ''
              if (!this.isFileTypeField(item)) {
                // 普通字段处理简单
                this.appendParam(params, item.key, item.value)
                return true
              }
              // 文件类型处理逻辑比较复杂
              if (!this.editMode) {
                // 新增模式，有上传文件才填充
                if (item.value) {
                  this.appendParam(params, item.key, item.value.raw)
                }
              } else {
                // 编辑模式
                if (item.value) {
                  // 有值的情况有2种：1. 上传新文件，value是File类型，2.保持不变，value是字符串类型
                  if (item.value instanceof Object) {
                    // 上传新文件才需要填充
                    this.appendParam(params, item.key, item.value.raw)
                  }
                } else {
                  // 无值的情况，有可能是没上传，也可能是删除原文件，这种情况增加一个隐藏字段，让后端去判断删除
                  this.appendParam(params, `__del__${item.key}`, item.value)
                }
              }
            })
            const async = this.editMode ? resource.update(app, model, this.sourceKey, params) : resource.add(app, model, params)
            async.then(res => {
              vm.$message.success(vm.editMode ? '更新成功' : '添加成功')
              resolve()
            }).catch(err => {
              vm.echoError(err)
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
