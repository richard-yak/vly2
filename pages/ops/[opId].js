import { useState, useEffect, useCallback } from 'react'
import { message } from 'antd'
import { useRouter } from 'next/router'
import Loading from '../../components/Loading'
import OpTabs from '../../components/Op/OpTabs'
import {
  FullPage
} from '../../components/VTheme/VTheme'

import reduxApi, { withMembers, withOps } from '../../lib/redux/reduxApi.js'
import reduxWrapper from '../../lib/redux/store'

import { MemberStatus } from '../../server/api/member/member.constants'
import OpBanner from '../../components/Op/OpBanner'
import OpUnknown from '../../components/Op/OpUnknown'
import OpShortForm from '../../components/Op/OpShortForm'
import OpVolunteerInterestSection from '../../components/Op/OpVolunteerInterestSection'
import Head from 'next/head'
// import { OpStatusStamp } from '../../components/Op/OpStatus'
import { OpportunityStatus, OpportunityType } from '../../server/api/opportunity/opportunity.constants'
import { Role } from '../../server/services/authorize/role.js'

const blankOp = {
  name: '',
  type: OpportunityType.ASK,
  subtitle: '',
  imgUrl: '/static/img/opportunity/opportunity.png',
  duration: '',
  locations: ['Online'],
  status: OpportunityStatus.DRAFT,
  date: [],
  startDate: null,
  endDate: null,
  tags: []
}

// const OpDetailForm = type => {
//   switch (type) {
//     case OpportunityType.ASK: return OpAskForm
//     case OpportunityType.OFFER: return OpOfferForm
//     default: return <p>Error: Opportunity type not Set</p>
//   }
// }

export const OpDetailPage = ({
  members,
  me,
  opportunities,
  isNew,
  opType,
  dispatch,
  isAuthenticated,
  actid,
  activities,
  tags,
  locations
}) => {
  const router = useRouter()
  const { asPath, query, pathname, replace, back } = router

  const [tab, setTab] = useState(isNew ? 'edit' : query.tab)
  useEffect(() => {
    const qtab = asPath.match(/.*tab=(.*)/)
    qtab && setTab(qtab[1])
  }, [query, asPath])
  let op
  const updateTab = useCallback((key, top) => {
    if (top) window.scrollTo(0, 0)
    const newpath = `/ops/${op._id}?tab=${key}`
    replace(pathname, newpath, { shallow: true })
  }, [pathname, op, replace])
  const handleTabChange = (key, e) => {
    updateTab(key, key === 'edit')
  }
  const handleCancel = () => {
    if (isNew) { // return to previous
      back()
    } else {
      updateTab('about', true)
    }
  }
  const handleSubmit = useCallback(
    async (op1) => {
      let res = {}
      if (op1._id) {
        // update existing op
        res = await dispatch(
          reduxApi.actions.opportunities.put(
            { id: op1._id },
            { body: JSON.stringify(op1) }
          )
        )
        updateTab('about', true)
      } else {
        // save new opportunity
        res = await dispatch(
          reduxApi.actions.opportunities.post(
            {},
            { body: JSON.stringify(op) })
        )
        setTab('about')
        // replace(pathname, `/ops/${res[0]._id}`) // reload to the new id page
        router.push(`/ops/${res[0]._id}`)
      }
      message.success('Saved.')
    }, [dispatch, op, pathname, replace, updateTab])

  // bail early if no data
  if (!opportunities.sync && !isNew) {
    return <Loading label='activity' entity={opportunities} />
  }
  const ops = opportunities.data
  if (ops.length === 0 && !isNew) {
    return <OpUnknown />
  }

  // setup the opportunity data

  if (isNew) {
    // new op
    op = blankOp
    op.type = opType

    // init from activity if provided
    if (actid) {
      const act = activities.data[0]

      op = {
        ...blankOp,
        name: act.name,
        subtitle: act.subtitle,
        // description: act.description,
        imgUrl: act.imgUrl,
        duration: act.duration,
        tags: act.tags,
        fromActivity: actid
      }
    }
    op.requestor = me
  } else { // existing op
    op = {
      ...opportunities.data[0],
      startDate: opportunities.data[0].date[0],
      endDate: opportunities.data[0].date[1]
    }
  }
  // Who can edit?
  const isAdmin = me && me.role.includes(Role.ADMIN)
  const isOwner =
      isNew ||
      (me && op.requestor && me._id === op.requestor._id)

  let isOrgAdmin = false

  // add org membership to me so it can be used for offerOrg
  if (me && members.sync && members.data.length > 0) {
    me.orgMembership = members.data.filter(m =>
      [MemberStatus.MEMBER, MemberStatus.ORGADMIN].includes(m.status)
    )
    if (!op.offerOrg && me.orgMembership.length > 0) {
      op.offerOrg = { _id: me.orgMembership[0].organisation._id }
    }
    if (op.offerOrg && me.orgMembership) {
      isOrgAdmin = me.orgMembership.find(m => {
        return (m.status === MemberStatus.ORGADMIN &&
        m.organisation._id === op.offerOrg._id).length > 0
      })
    }
  }
  const canManage = isOwner || isAdmin || isOrgAdmin
  const canRegisterInterest = isAuthenticated && !isOwner
  if (tab === 'edit') {
    return (
      <FullPage>
        <Head>
          <title>Edit {op.type} {op.name} - Voluntarily</title>
        </Head>
        <OpShortForm
          op={op}
          me={me}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          existingTags={tags.data}
          locations={locations.data[0]}
        />
      </FullPage>
    )
  }
  return (
    <FullPage>

      <Head>
        <title>{op.type} {op.name} - Voluntarily</title>
      </Head>

      <OpBanner op={op}>
        {/* <OpStatusStamp status={op.status} /> */}
        <OpVolunteerInterestSection
          isAuthenticated={isAuthenticated}
          canRegisterInterest={canRegisterInterest}
          opid={op && op._id}
          meid={me && me._id}
          type={op.type}
        />
      </OpBanner>
      <OpTabs
        op={op}
        canManage={canManage}
        canEdit={canManage}
        tab={tab}
        onChange={handleTabChange}
        author={me._id}
      />
    </FullPage>
  )
}

export const getServerSideProps = reduxWrapper.getServerSideProps(
  store => async (props) => gssp({ store, query: props.query })
)

export const gssp = async ({ store, query }) => {
  console.log('op/:id gssp', query)
  const me = store.getState().session.me
  // Get one Org
  await Promise.all([
    store.dispatch(reduxApi.actions.locations.get({})),
    store.dispatch(reduxApi.actions.tags.get({}))
  ])

  if (me._id) {
    await store.dispatch(reduxApi.actions.members.get({ meid: me._id.toString() }))
  }

  // query.session = store.getState().session //  Inject session with query that restricted api access
  await store.dispatch(reduxApi.actions.opportunities.get({ id: query.opId }))
}

export default withMembers(withOps(OpDetailPage))
