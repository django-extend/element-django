<template>
  <el-select
    v-el-select-loadmore="handleScroll"
    :value="valueString(value)"
    remote
    filterable
    clearable
    :loading="loading"
    :remote-method="handleSearch"
    @change="handleChange"
  >
    <el-option
      v-for="choice in choices"
      :key="choice.key"
      :label="choice.label"
      :value="choice.key"
    />
    <li v-if="loadingMore" class="more">加载中</li>
  </el-select>
</template>
<script>

/*
element select BUG （https://github.com/ElemeFE/element/issues/952）
不能显示不存在的条目，什么情况下有这种业务需求呢？
远程加载选项+有分页情况下，在非第一页选中后提交，下次编辑的时候就会这样。
element处于不维护状态，估计也不会有官方修复了
洒家没办法，只能凑合根据value远程单独加载一个选项强插入进来

貌似官方的v-infinite-scroll也有BUG
lazy加载使用如下方法（https://blog.csdn.net/weixin_33696106/article/details/88662281）
*/

import * as resource from '../api/resource'
const DEFAULT_PAGESIZE = 10

export default {
  directives: {
    'el-select-loadmore': {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        SELECTWRAP_DOM.addEventListener('scroll', function() {
          /**
          * scrollHeight 获取元素内容高度(只读)
          * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
          * clientHeight 读取元素的可见高度(只读)
          * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
          * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
          */
          const condition = this.scrollHeight - this.scrollTop <= this.clientHeight
          if (condition) {
            binding.value()
          }
        })
      }
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [String, Number],
      default: undefined
    },
    relation: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      choices: [],
      pageInfo: {},
      loading: false,
      loadingMore: false,
      searchKeyword: ''
    }
  },
  created() {
    const pageSize = this.relation.lazy ? DEFAULT_PAGESIZE : -1
    this.loading = true
    resource.listAutoComplete(this.relation.app, this.relation.model, { pageSize: pageSize }).then(res => {
      const data = res.result.data
      const pageInfo = res.result
      if (this.needPatch(data)) {
        resource.getStr(this.relation.app, this.relation.model, this.value).then(res => {
          data.push({ key: this.value.toString(), label: res.str })
          this.choices = data
          this.pageInfo = pageInfo
          this.loading = false
        })
      } else {
        this.choices = data
        this.pageInfo = pageInfo
        this.loading = false
      }
    })
  },
  methods: {
    valueString(value) {
      // 不支持option.key=0
      return value ? value.toString() : ''
    },
    needPatch(data) {
      if (!this.value) {
        return false
      }
      return this.valueInList(data, this.value) === null
    },
    valueInList(data, value) {
      value = value.toString()
      let rs = null
      data.forEach(item => {
        if (item.key === value) {
          rs = item
          return false
        }
      })
      return rs
    },
    doAutoCompleteLoad(next) {
      if (this.loading || this.loadingMore) {
        return
      }
      if (this.pageInfo.totalPage && this.pageInfo.pageNo >= this.pageInfo.totalPage) {
        return
      }
      const params = {
        pageSize: DEFAULT_PAGESIZE,
        search: this.searchKeyword
      }
      if (this.pageInfo.pageNo) {
        params.pageNo = this.pageInfo.pageNo + 1
      }
      next ? this.loadingMore = true : this.loading = true
      resource.listAutoComplete(this.relation.app, this.relation.model, params).then(res => {
        next ? this.loadingMore = false : this.loading = false
        this.pageInfo = res.result
        res.result.data.forEach((item, index) => {
          if (this.valueInList(this.choices, item.key)) {
            res.result.data.splice(index, 1)
            return false
          }
        })
        this.choices.push(...res.result.data)
      })
    },
    handleSearch(val) {
      this.searchKeyword = val
      this.pageInfo = {}
      this.choices = []
      this.doAutoCompleteLoad()
    },
    handleScroll() {
      this.doAutoCompleteLoad(true)
    },
    handleChange(val) {
      if (typeof this.value === 'number') {
        val = val ? Number(val) : undefined
      }
      this.$emit('change', val)
    }
  }
}
</script>
<style scoped>
.more {
  text-align:center;
  color:#606266;
  font-size:14px;
  height: 20px;
}
</style>
