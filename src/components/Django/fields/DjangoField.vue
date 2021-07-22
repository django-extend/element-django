<template>
  <div>
    <el-input-number v-if="meta.type==='integer'" step-strictly :value="value" @input="handleChange" />
    <el-input-number
      v-else-if="meta.type==='decimal'"
      step-strictly
      :value="value"
      :precision="meta.decimal_places"
      :step="getDecimalStep(meta.decimal_places)"
      @input="handleChange"
    />
    <el-select v-else-if="meta.type==='choice'" :value="value" @change="handleChange">
      <el-option
        v-for="choice in meta.choices"
        :key="choice.value"
        :label="choice.display_name"
        :value="choice.value"
      />
    </el-select>
    <el-switch v-else-if="meta.type==='boolean'" :value="value" @change="handleChange" />
    <el-date-picker
      v-else-if="meta.type==='date'"
      v-model="datetimeValue"
      @change="handleChangeDatetime"
    />
    <el-date-picker
      v-else-if="meta.type==='datetime'"
      v-model="datetimeValue"
      type="datetime"
      @change="handleChangeDatetime"
    />
    <el-time-picker
      v-else-if="meta.type==='time'"
      v-model="datetimeValue"
      @change="handleChangeDatetime"
    />
    <el-input
      v-else-if="meta.input_type==='textarea'"
      type="textarea"
      :value="value"
      :autosize="{ minRows: 2, maxRows: 4}"
      @input="handleChange"
    />
    <django-file-field
      v-else-if="meta.type=='file upload'"
      :value="value"
      :can-delete="!meta.required"
      @change="handleChange"
    />
    <django-image-field
      v-else-if="meta.type=='image upload'"
      :value="value"
      :can-delete="!meta.required"
      @change="handleChange"
    />
    <foreign-select
      v-else-if="meta.type==='field' && meta.field_type==='ManyToOne'"
      :value="value"
      :relation="meta.relation"
      @change="handleChange"
    />
    <django-many-to-many-field
      v-else-if="meta.type==='field' && meta.field_type==='ManyToMany'"
      :value="value"
      :choices="meta.choices"
      @change="handleChange"
    />
    <el-input
      v-else-if="meta.input_type==='password'"
      show-password
      :value="value"
      :max-ength="meta.max_length"
      @input="handleChange"
    />
    <el-input v-else :value="value && value.toString()" :max-ength="meta.max_length" @input="handleChange" />
  </div>
</template>
<script>
import moment from 'moment'
import DjangoFileField from './DjangoFileField'
import DjangoImageField from './DjangoImageField'
import ForeignSelect from './ForeignSelect'
import DjangoManyToManyField from './DjangoManyToManyField'

export default {
  components: { ForeignSelect, DjangoFileField, DjangoImageField, DjangoManyToManyField },
  model: {
    prop: 'value',
    event: 'change'
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['value', 'meta'],
  data() {
    return {
      datetimeValue: null
    }
  },
  watch: {
    value(val) {
      if (!val) {
        this.datetimeValue = null
        return
      }
      switch (this.meta.type) {
        case 'date':
          this.datetimeValue = moment(this.value, 'YYYY-MM-DD')
          break
        case 'datetime':
          this.datetimeValue = moment(this.value, 'YYYY-MM-DD HH:mm:ss')
          break
        case 'time':
          this.datetimeValue = moment(this.value, 'HH:mm:ss')
          // 补全日期，否则无法显示
          this.datetimeValue.set({ 'year': 2020, 'month': 1, 'date': 1 })
          break
      }
    }
  },

  methods: {
    getDecimalStep(precision) {
      let rs = 1
      for (let i = 0; i < precision; i++) {
        rs /= 10
      }
      return rs
    },
    formatDatetime(value) {
      let pattern
      switch (this.meta.type) {
        case 'date':
          pattern = 'YYYY-MM-DD'
          break
        case 'datetime':
          pattern = 'YYYY-MM-DD HH:mm:ss'
          break
        case 'time':
          pattern = 'HH:mm:ss'
          break
      }
      return value ? moment(value).format(pattern) : ''
    },
    isDatetimeType(type) {
      return ['date', 'datetime', 'time'].indexOf(type) >= 0
    },
    handleChange(value) {
      this.$emit('change', value)
    },
    handleChangeDatetime(value) {
      this.$emit('change', this.formatDatetime(value))
    }
  }
}
</script>
