import React from 'react'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { Icon, Tabs } from 'antd'
import Markdown from 'markdown-to-jsx'
import OrgType from './OrgType'
import Head from 'next/head'
import styled from 'styled-components'
import {
  PageHeaderContainer,
  TextHeadingBlack,
  GridContainer,
  TextPBold,
  TextH1,
  SpacerSmall,
  Spacer
} from '../VTheme/VTheme'


function callback (key) {
  // TODO: [VP-300] on tab change update the path so that the page is bookmark and reloadable
  // console.log(key)
}
var shadowStyle = { overflow: 'visible' }
const { TabPane } = Tabs

const TitleContainer=styled.div`
margin-bottom: 2rem;
`

const OrgGrid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 5rem;
`
const OrgContainer = styled.div`
  margin-top: 5rem;
`

const ContactContainer = styled.div`
margin-top: 0.5rem;
display: inline-block;
`

const orgTab = (
  <span>
    <Icon type='info-circle' />
    <FormattedMessage
      id='orgAbout'
      defaultMessage='About'
      description='show opportunities list on volunteer home page'
    />
  </span>
)
const orgResourcesTab = (
  <span>
<Icon type="fire" />
    <FormattedMessage
      id='orgResources'
      defaultMessage='Offers'
      description='show opportunities list on volunteer home page'
    />
  </span>
)
const orgInstructionTab = (
  <span>
    <Icon type="usergroup-add" />
    <FormattedMessage
      id='orgInstruction'
      defaultMessage='Getting Started'
      description='show opportunities list on volunteer home page'
    />
  </span>
)
const orgMemberTab = (
  <span>
    <Icon type="team" />
    <FormattedMessage
      id='orgMembers'
      defaultMessage='Members'
      description='show opportunities list on volunteer home page'
    />
  </span>
)


const OrgDetail = ({ org, ...props }) => (
  <div>
    <Head title={org.title} />
    <PageHeaderContainer />
    <OrgGrid>
      <GridContainer>
        <img
          style={{ width: '100%', maxWidth: '240px' }}
          src={org.imgUrl}
          alt={org.name}
        />
        <OrgContainer>
          <TextPBold>Get in touch</TextPBold>
          <ContactContainer><Icon type='global' />&nbsp;&nbsp;placeholderwebsite.co.nz</ContactContainer>
          <ContactContainer><Icon type='mail' />&nbsp;&nbsp;placeholder@email.co.nz</ContactContainer>
          <ContactContainer><Icon type='facebook' />&nbsp;&nbsp;placeholder</ContactContainer>
          <ContactContainer><Icon type='twitter' />&nbsp;@placeholderTwitter</ContactContainer>

        </OrgContainer>
      </GridContainer>

      <GridContainer>
        <TitleContainer>
        <TextH1>{org.name}</TextH1>
        </TitleContainer>
        <Tabs style={shadowStyle} defaultActiveKey='1' onChange={callback}>
          <TabPane tab={orgTab} key='1'>
            <SpacerSmall />
            <Markdown children={org.about || ''} />
            <OrgType orgType={org.type} />
          </TabPane>
          <TabPane tab={orgResourcesTab} key='2'>

          </TabPane>
          <TabPane tab={orgInstructionTab} key='3'>
            <p>aaaa</p>
          </TabPane>
          <TabPane tab={orgMemberTab} key='4'>
            <p>aaaa</p>
          </TabPane>
          
        </Tabs>
      </GridContainer>
    </OrgGrid>
  </div>
)

OrgDetail.propTypes = {
  org: PropTypes.shape({
    name: PropTypes.string.isRequired,
    about: PropTypes.string.isRequired,
    type: PropTypes.arrayOf(
      PropTypes.oneOf(['admin', 'op', 'vp', 'ap', 'other'])
    ).isRequired,
    imgUrl: PropTypes.string,
    _id: PropTypes.string.isRequired
  }).isRequired
}

export default OrgDetail
