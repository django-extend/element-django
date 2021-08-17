<template>
  <el-form
    ref="ruleForm"
    v-loading="loading"
    :model="{}"
    label-width="100px"
  >
    <el-descriptions v-for="fieldset in fieldsets" :key="fieldset[0]" :title="fieldset[0] " :column="1" border style="padding-top:10px">
      <el-descriptions-item v-for="field in fieldset[1].fields" :key="field.name" :label="field.meta.label">
        <django-value :value="field.value" :meta="field.meta" />
      </el-descriptions-item>
    </el-descriptions>
  </el-form>
</template>
<script>
import * as resource from '@/components/Django/api/resource'
import DjangoValue from '@/components/Django/fields/DjangoValue'

export default {
  components: { DjangoValue },
  props: {
    sourceKey: {
      type: String,
      required: true
    },
    metaInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      fieldsets: []
    }
  },
  watch: {
    sourceKey(val) {
      this.loadData()
    }
  },
  created() {
    this.bindForm()
    this.loadData()
  },
  methods: {
    resetData() {
      this.fieldsets = []
    },
    bindForm() {
      this.resetData()
      const fieldInfos = this.metaInfo.actions.POST
      const sourceFieldsets = this.metaInfo.fieldsets
      const fieldsets = []
      sourceFieldsets.forEach(item => {
        const fields = []
        item[1].fields.forEach(name => {
          const meta = fieldInfos[name]
          fields.push({
            meta: meta,
            name: name,
            value: null
          })
        })
        fieldsets.push([item[0], { fields: fields }])
      })
      this.fieldsets = fieldsets
    },
    bindData(values) {
      this.fieldsets.forEach(fieldset => {
        const fields = fieldset[1].fields
        fields.forEach(field => {
          field.value = values[field.name]
        })
      })
    },
    loadData() {
      this.loading = true
      const [app, model] = this.$route.name.split('.')
      resource.getView(app, model, this.sourceKey).then(res => {
        this.bindData(res)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
