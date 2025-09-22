import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BotProvider } from './store/aiBotContext'

const bd: any = {
        "nl_query": "查询2025年各月佛山市的工单总数环比变化情况，按环比值降序",
        "table_structure": [
            {
                "table_name": "d_work_order",
                "field_name": "id",
                "field_type": "int",
                "remark": "工单ID"
            },
            {
                "table_name": "d_work_order",
                "field_name": "problem_location",
                "field_type": "varchar",
                "remark": "问题属地"
            },
            {
                "table_name": "d_work_order",
                "field_name": "reporting_time",
                "field_type": "datetime",
                "remark": "上报时间"
            }
        ],
        "dynamic_params": [
            {
                "param_name": "problemLocation",
                "param_type": "string",
                "remark": "问题属地",
                "default_value": "佛山市"
            }
        ],
        "builtin_params": [
            {
                "param_name": "pageNum",
                "param_type": "int",
                "remark": "页码",
                "default_value": 1
            }
        ],
        "sql": "",
        "error_msg": ""
    }
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BotProvider config={{
      baseInfo: bd,
      //   sseUrl: 'http://192.168.0.216:8000/generate-sql',
      sseUrl: 'http://172.26.30.146:31220/generate-sql',
      name: "SQL助手",
      slot: {
        inputTop: <div>
          <span>问题属地：</span>
          <select name="problemLocation" id="problemLocation">
            <option value="佛山市">佛山市</option>
            <option value="顺德区">顺德区</option>
            <option value="南海区">南海区</option>
            <option value="高明区">高明区</option>
          </select>
        </div>
      }
    }}>
      <App />
    </BotProvider>
  </StrictMode>,
)
