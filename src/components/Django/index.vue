<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form v-if="auth('view')" :inline="true" :model="queryParam">
        <template v-if="metaInfo.filters">
          <el-form-item
            v-for="filter in metaInfo.filters.listFilter"
            :key="filter.key"
            :label="filter.label"
          >
            <el-select v-model="queryParam[filter.key]" @change="refreshData(true)">
              <el-option key="" label="全部" value="" />
              <el-option
                v-for="choice in filter.choices"
                :key="choice[0]"
                :label="choice[1]"
                :value="choice[0]"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="metaInfo.filters.searchFields.length > 0">
            <el-input
              v-model="queryParam.search"
              clearable
              :placeholder="formatPlaceholder(metaInfo.filters.searchFields)"
              suffix-icon="el-icon-search"
              @change="refreshData(true)"
            />
          </el-form-item>
        </template>
      </el-form>
      <el-row type="flex">
        <el-col :span="22">
          <div v-if="actions.items && actions.items.length!=0">
            <el-select v-model="currentAction" style="min-width:100px">
              <el-option key="" label="--------" value="" />
              <el-option v-for="item in actions.items" :key="item.action" :label="item.name" :value="item.action" />
            </el-select>
            <el-button style="margin-left:10px" type="primary" @click="handleBulkAction">执行</el-button>
          </div>
        </el-col>
        <el-col :span="2">
          <el-button v-if="auth('add')" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd">
            {{ $t('table.add') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <elx-table
      v-if="!loading && auth('view')"
      ref="table"
      :data="getList"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      row-key="pk"
      :page-size="metaInfo.pageSize"
      :row-selection="{selectedRowKeys: selectedRowKeys, onChange: handleSelectChange}"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.dataIndex"
        :prop="column.dataIndex"
        :label="column.title"
      >
        <template slot-scope="{row}">
          <django-value
            :value="row[column.dataIndex]"
            :meta="getMeta(column.dataIndex)"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <template v-if="auth('change')">
            <el-button type="primary" size="mini" @click="handleEdit(row)">
              {{ $t('table.edit') }}
            </el-button>
            <el-divider direction="vertical" />
          </template>
          <template v-else-if="auth('view')">
            <el-button type="primary" size="mini" @click="handleView(row)">
              {{ $t('table.view') }}
            </el-button>
            <el-divider direction="vertical" />
          </template>
          <el-popconfirm v-if="auth('delete')" title="确定删除吗？" @onConfirm="handleDelete(row)">
            <el-button slot="reference" size="mini" type="danger">
              {{ $t('table.delete') }}
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </elx-table>
    <edit-dialog :visible="visiblePopup" :edit-mode="editMode" :source-key="editSourceKey" :meta-info="metaInfo" @close="handleClosePopup" />
    <view-dialog :visible.sync="visibleView" :source-key="viewSourceKey" :meta-info="metaInfo" />
  </div>
</template>
<script>
import * as resource from '@/components/Django/api/resource'
import EditDialog from './form/EditDialog'
import ViewDialog from './form/ViewDialog'
import DjangoValue from './fields/DjangoValue'
import ElxTable from './components/Table'

export default {
  components: { EditDialog, ViewDialog, ElxTable, DjangoValue },
  data() {
    return {
      columns: [
      ],
      slots: [],
      metaInfo: {},
      queryParam: {
      },
      actions: {},
      currentAction: '',
      selectedRowKeys: [],

      editSourceKey: '',
      editMode: false,
      visiblePopup: false,
      viewSourceKey: '',
      visibleView: false,
      loading: false
    }
  },
  created() {
    this.readMetaInfo()
  },
  methods: {
    auth(action) {
      const permissions = this.$store.getters.roles.permissions
      if (!permissions) {
        // 退出登录，会清除store，导致页面异常
        return
      }
      const permissionId = this.$route.meta.permission
      const actions = permissions.find(item => {
        return item.permissionId === permissionId
      }).actionList
      return actions.indexOf(action) !== -1
    },
    getMeta(key) {
      return this.metaInfo ? this.metaInfo.actions.POST[key] : null
    },
    formatPlaceholder(source) {
      return source.map(item => {
        return item.label
      }).join('/')
    },
    getModelInfo() {
      const [app, model] = this.$route.name.split('.')
      return {
        app: app,
        model: model
      }
    },
    async readMetaInfo() {
      this.loading = true
      this.metaInfo = await this.$store.dispatch('meta/getInfo', this.$route.name)
      this.metaInfo.filters.listFilter.forEach(filter => {
        this.queryParam[filter.key] = ''
      })
      this.loading = false
    },
    getList(parameter) {
      const { app, model } = this.getModelInfo()
      const noEmptyParams = Object.fromEntries(Object.entries(this.queryParam).filter(([key, value]) => value !== ''))
      const requestParameters = Object.assign({}, noEmptyParams, parameter)
      return resource.list(app, model, requestParameters).then(res => {
        this.columns = res.columns
        this.actions = res.actions
        return res.result
      })
    },
    refreshData(bool = false) {
      if (!this.auth('view')) {
        return
      }
      this.$refs.table && this.$refs.table.refresh(bool)
    },
    handleEdit(record) {
      this.editMode = true
      this.editSourceKey = record.pk
      this.visiblePopup = true
    },
    handleView(record) {
      this.viewSourceKey = record.pk
      this.visibleView = true
    },
    handleAdd() {
      this.editMode = false
      this.editSourceKey = ''
      this.visiblePopup = true
    },
    handleDelete(record) {
      const { app, model } = this.getModelInfo()
      resource.del(app, model, record.pk).then(res => {
        this.$message.success('记录已删除')
        this.refreshData()
      })
    },
    handleClosePopup(needReloaded) {
      this.editSourceKey = ''
      this.visiblePopup = false
      if (needReloaded) {
        this.refreshData()
      }
    },
    handleSelectChange(keys) {
      this.selectedRowKeys = keys
    },
    handleBulkAction() {
      if (this.currentAction === '') {
        return
      }
      const { app, model } = this.getModelInfo()
      const params = {
        ids: this.selectedRowKeys
      }
      resource.bulkAction(app, model, this.currentAction, params).then(res => {
        res.message.forEach(item => {
          let name
          switch (item.level) {
            case 20:
              name = 'info'
              break
            case 25:
              name = 'success'
              break
            case 30:
              name = 'warning'
              break
            case 40:
              name = 'error'
              break
            default:
              name = 'info'
              break
          }
          this.$message[name](item.message)
        })
        this.refreshData()
      })
    }
  }
}
</script>
