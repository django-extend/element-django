<template>
  <el-row v-loading="loading">
    <el-col>
      <el-table
        ref="multipleTable"
        v-bind="dyamicProps"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="selectionEnabled" type="selection" width="55" />
        <slot />
      </el-table>
      <el-pagination
        class="pagination-container"
        hide-on-single-page
        :current-page.sync="pageInfo.pageNo"
        :page-sizes="pageSizes"
        :page-size.sync="pageInfo.pageSize"
        :total="pageInfo.totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-col>
  </el-row>
</template>
<script>
import { Table } from 'element-ui'
export default {
  name: 'ElxTable',
  props: Object.assign({}, Table.props, {
    // 内置覆盖
    data: {
      type: Function,
      required: true
    },
    // 扩展
    rowKey: {
      type: String,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    rowSelection: {
      type: Object,
      default: null
    }
  }),
  data() {
    return {
      localData: [],
      localSelection: [],
      pageInfo: {},
      pageSizes: [],
      multipleSelection: [],
      loading: false
    }
  },
  computed: {
    selectionEnabled: {
      get() {
        return this.rowSelection !== null
      }
    },
    dyamicProps: {
      get() {
        const rs = {}
        Object.keys(Table.props).forEach(key => {
          if (key === 'data') {
            rs[key] = this.localData
          } else {
            this[key] && (rs[key] = this[key])
          }
        })
        return rs
      }
    }
  },
  created() {
    this.pageInfo = this.defaultPageInfo()
    if (this.selectionEnabled && this.rowSelection.selectedRowKeys) {
      this.localSelection = this.rowSelection.selectedRowKeys
    }
    this.buildPageSizeOptions()
    this.loadData()
  },
  methods: {
    buildPageSizeOptions() {
      let pages = [10, 20, 50, 100]
      pages.push(this.pageInfo.pageSize)
      pages = Array.from(new Set(pages)).sort((a, b) => { return a - b })
      this.pageSizes = pages
    },
    minusArray(a, b) {
      return [...a].filter(x => b.indexOf(x) === -1)
    },
    diffArray(src, dst) {
      return {
        addList: this.minusArray(dst, src),
        deleteList: this.minusArray(src, dst)
      }
    },
    defaultPageInfo() {
      return {
        pageNo: 1,
        pageSize: this.pageSize,
        totalCount: 0
      }
    },
    loadData() {
      this.loading = true
      this.multipleSelection = []
      const parameter = {
        pageSize: this.pageInfo.pageSize,
        pageNo: this.pageInfo.pageNo
      }
      this.data(parameter).then(res => {
        this.localData = res.data
        this.pageInfo = {
          pageSize: res.pageSize,
          pageNo: res.pageNo,
          totalPage: res.totalPage,
          totalCount: res.totalCount
        }
        this.forceSelect()
      }).finally(() => {
        this.loading = false
      })
    },
    forceSelect() {
      this.localData.forEach(item => {
        const key = item[this.rowKey]
        if (this.localSelection.indexOf(key) !== -1) {
          this.$nextTick(() => {
            this.$refs.multipleTable.toggleRowSelection(item)
          })
        }
      })
    },
    handleSelectionChange(val) {
      const keys = val.map(x => x[this.rowKey])
      // 根据当前页选择列表，筛出哪些新增，哪些删除
      const { addList, deleteList } = this.diffArray(this.multipleSelection, keys)
      this.multipleSelection = keys

      // 删除项从全集中删除
      let selection = this.localSelection.filter(x => deleteList.indexOf(x) === -1)
      let dirty = selection.length !== this.localSelection.length
      // 新增项加入到全集中
      selection = selection.concat(addList)
      // 翻页会强制选中(toggleRowSelection)，触发selectionChange，导致key重复，简单做一下set去重
      selection = Array.from(new Set(selection))
      if (!dirty && selection.length !== this.localSelection.length) {
        dirty = true
      }
      if (dirty) {
        this.localSelection = selection
        this.rowSelection.onChange(this.localSelection)
      }
    },
    handleSizeChange(val) {
      this.pageInfo.pageNo = 1
      this.loadData()
    },
    handleCurrentChange() {
      this.loadData()
    },
    // 外部接口函数
    /**
     * 表格重新加载方法
     * 如果参数为 true, 则强制刷新到第一页
     * @param Boolean bool
     */
    refresh(bool = false) {
      bool && (this.pageInfo = this.defaultPageInfo())
      this.loadData()
    }
  }
}
</script>
<style scoped>
.pagination-container {
  background: #fff;
  padding: 5px 16px;
}
</style>
