import * as service from '../services/bloggerService'

export default {

    namespace: 'blogger',

    state: {
        list: [],
        page: 0,
        count: 0,
        single: {},
        friends: [],
        weiboContent: [],
        tfidf: [],
        sexDistribution: [],
        locationDistribution: [],
        average: []
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },

    effects: {
        *getDistribution({ payload }, { call, put }) {
            const sexDistribution = yield call(service.getSexDistribution)
            const locationDistribution = yield call(service.getLocationDistribution)
            const average = yield call(service.getAverage)

            yield put({
                type: 'save', payload: {
                    sexDistribution,
                    locationDistribution,
                    average
                }
            });
        },
        *getList({ payload }, { call, put }) {
            const counter = yield call(service.getBloggersCount, {
                name: payload.name
            })
            const list = yield call(service.getBloggers, {
                page: payload.page || 0,
                pageSize: payload.pageSize || 10,
                name: payload.name
            })

            yield put({
                type: 'save',
                payload: {
                    list,
                    count: counter.count,
                    page: payload.page,

                }
            });
        },
        *getSingle({ payload }, { call, put }) {
            const single = yield call(service.getBlogger, { id: payload.id })
            yield put({
                type: 'save',
                payload: {
                    single: single[0],
                }
            })
            const friends = yield call(service.getBloggerFriends, { id: payload.id })
            const weiboContent = yield call(service.getBloggerWeiboContent, { id: payload.id })

            yield put({
                type: 'save',
                payload: {
                    friends,
                    weiboContent: weiboContent.contents,
                    tfidf: weiboContent.tfidf
                }
            });
        },
    },

    subscriptions: {
        init({ dispatch }) {
            dispatch({
                type: "getDistribution",
            })
            dispatch({
                type: "getList",
                payload: { page: 0, pageSize: 10 }
            })
        },
        setup({ dispatch, history }) {  // eslint-disable-line
            return history.listen(({ pathname }) => {
                // 当前path在deploy
                const regex = /^\/bloggers\/(.+)$/
                const match = regex.exec(pathname)
                if (match) {
                    dispatch({
                        type: "getSingle",
                        payload: {
                            id: match[1]
                        }
                    })
                } else {
                    dispatch({
                        type: "save",
                        payload: {
                            single: {}
                        }
                    })
                }
            })
        },
    },

};
