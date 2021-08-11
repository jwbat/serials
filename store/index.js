import { 
  nrsFromItems,
  nrFromObj, 
  objFromNr,
  emptyObj, 
  QFromNr, 
  isValid, 
  sortByQ,
  getNRandomItems,
  formatQ,
  getDate,
} from './utils.js';


export const state = () => ({
  items: [], // [{ Q, nr, name, date }]
  Q: 1
})


export const mutations = {
  addItem(state, item) {
    state.items = [...state.items, item];
  },
  addManyItems(state, arr) {
    state.items = [...state.items, ...arr];
  },
  removeItem(state, idx) {
    state.items.splice(idx, 1);
  },
  editItem(state, { idx, item }) {
    state.items.splice(idx, 1, item);
  },
  setQ(state, payload) {
    state.Q = payload;
  },
  incrementQ(state) {
    state.Q++;
  },
  deleteAll(state) {
    state.items = [];
  }
}


export const actions = {                               
  replaceAll({ commit, dispatch, getters }, payload) {    // TODO
//     const { nrObjects } = payload;
    const nrObj = { p, s, h, v, q, r };
    let nrs = nrObjects.map(obj => nrFromObj(obj));
    dispatch('deleteAll');
    commit('addManyNrs', nrs);
    commit('addManyItems', items);

    let Q = getters.largestQ;
    commit('setQ', Q + 1);
  },

  save({ commit, dispatch, getters }, fieldsObj) {
    const { p, s, h, v, q, r, name, date } = fieldsObj;
    const Q = +q;
    const nrObj = { p, s, h, v, q, r };
    const nr = nrFromObj(nrObj);
    const d = date || getDate();

    if (!isValid(nrObj)) return;

    const qExists = getters.QExists(Q);

    const item = { Q, nr, name, date: d };

    // add new item
    if (!qExists) {
      commit('addItem', item);
      commit('incrementQ');
    } else { // edit item
      const idx = getters.idxFromQ(Q);
      commit('editItem', { idx, item });
    }
  },

  move({ commit, dispatch, getters }, { fieldsObj, oldQ }) {
    const { p, s, h, v, q, r, name, date } = fieldsObj;
    const nrObj = { p, s, h, v, q, r };
    const newQ = +q;

    if (!isValid(nrObj)) return;
    const nr = nrFromObj(nrObj);
    const qExists = getters.QExists(newQ);
    if (qExists || newQ > getters.nextQ) return;
    const item = getters.itemFromQ(oldQ);
    dispatch('removeItem', oldQ);
    commit('addItem', { newQ, nr: nrObj, name, date });
  },
//     commit('sortNrs');

  removeItem({ commit, getters }, Q) {
    const idx = getters.idxFromQ(Q);
    console.log('** idx: ', idx);
    commit('removeItem', idx);
  },

  editQ({ commit, getters }, newQ) {
    let Q = +newQ;
    let bigQ = getters.largestQ;
    if (Q < bigQ) return;
    commit('setQ', Q);
  },

  addNRandom({ commit, getters }, n) {
    let addNR = getNRandomItems(n);
    let Q = getters.largestQ + 1;
    let items = addNR(Q);
    commit('addManyItems', items);
    Q = getters.largestQ + 1;
    commit('setQ', Q);
//     commit('sortNrs');
  },

  deleteAll({ commit }) {
    commit('deleteAll');
    commit('setQ', 1);
  }
}

export const getters = {
  items(state) {
    return [...state.items];
  },
  fieldsFromQ(state, getters) {
    return Q => {
      const item = getters.itemFromQ(Q);
      const nrObj = objFromNr(item.nr);
      return { ...nrObj, name: item.name, date: item.date };
    }
  },
  nrs(state) {
    return state.items.map(item => item.nr);
  },
  itemFromQ(state) {
    return Q => state.items.filter(item => item.Q === Q)[0];
  },
  idxFromQ(state) {
    return Q => state.items.reduce((acc, val, idx) => val.Q === Q ? idx : acc, 0);
  },
  nextQ(state) {
    return state.Q;
  },
  nextq(state) {
    return formatQ(state.Q);
  },
//  nextEmptyObject(state) {
//    const q = String(state.Q).padStart(3, 0);
//    return { ...emptyObj, q };
//  },
  nrFromQ(state, getters) {
    return Q => state.items.reduce((acc, val, idx) => val.Q === Q ? val.nr : acc, null);
  },
  QExists(state) {
    return Q => state.items.filter(item => item.Q === Q).length > 0;
  },
  QIsUnique(state) {
    return Q => state.items.filter(item => item.Q === Q).length === 1;
  },
  largestQ(state) {
    if (state.items.length < 1) {
      return 0;
    }
    let Qs = state.items.map(item => item.Q);
    return Qs.reduce((x, y) => x > y ? x : y);
  },
};
