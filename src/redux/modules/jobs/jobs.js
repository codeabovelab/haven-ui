import {ACTIONS} from './actions';
import _ from 'lodash';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case ACTIONS.LOAD_LIST_SUCCESS:
      let sortedResult = action.result.sort((a, b) => {
        if (_.get(a, 'createTime', '') > _.get(b, 'createTime', '')) {
          return -1;
        }
        return 1;
      });
      return {
        ...state,
        jobs: _.keyBy(sortedResult, 'id')
      };
    case ACTIONS.LOAD_INFO_SUCCESS:
      return {
        ...state,
        jobInfos: {
          ...state.jobInfos,
          [action.id]: action.result
        }
      };
    case ACTIONS.LOAD_LOG_SUCCESS:
      return {
        ...state,
        jobLogs: {
          ...state.jobLogs,
          [action.id]: action.result
        }
      };
    case ACTIONS.JOB_EVENT:
      let data = action.event;
      let jobId = _.get(data, 'info.id', null);
      if (jobId) {
        return {
          ...state,
          jobs: {
            ...state.jobs,
            [jobId]: data.info
          }
        };
      }
      return state;

    default:
      return state;
  }
}

export function loadList() {
  return {
    types: [ACTIONS.LOAD_LIST, ACTIONS.LOAD_LIST_SUCCESS, ACTIONS.LOAD_LIST_FAIL],
    id: "jobs",
    promise: (client) => client.get('/ui/api/jobs/')
  };
}

export function loadInfo(jobId) {
  return {
    types: [ACTIONS.LOAD_INFO, ACTIONS.LOAD_INFO_SUCCESS, ACTIONS.LOAD_INFO_FAIL],
    id: jobId,
    promise: (client) => client.get(`/ui/api/jobs/${jobId}/`)
  };
}

export function loadLog(jobId) {
  return {
    types: [ACTIONS.LOAD_LOG, ACTIONS.LOAD_LOG_SUCCESS, ACTIONS.LOAD_LOG_FAIL],
    id: jobId,
    promise: (client) => client.get(`/ui/api/jobs/${jobId}/log`)
  };
}

export function deleteJob(jobId) {
  return {
    types: [ACTIONS.DELETE_JOB, ACTIONS.DELETE_JOB_SUCCESS, ACTIONS.DELETE_JOB_FAIL],
    id: jobId,
    promise: (client) => client.del(`/ui/api/jobs/${jobId}/`)
  };
}

export function rollbackJob(jobId) {
  let rollBackData = {
    type: "job.rollback",
    title: "Rollback " + jobId,
    parameters: {
      jobId: jobId
    }
  };
  return {
    types: [ACTIONS.ROLLBACK_JOB, ACTIONS.ROLLBACK_JOB_SUCCESS, ACTIONS.ROLLBACK_JOB_FAIL],
    id: jobId,
    promise: (client) => client.post('ui/api/jobs/', {data: rollBackData})
  };
}
