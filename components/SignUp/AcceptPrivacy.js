import Privacy from '../../assets/notices/privacy-en.md'
import { HalfGrid } from '../VTheme/VTheme'
import Image from 'next/image'

/**
 * This page asks the person to select whether they are an asker or offerer
 */
export const AcceptPrivacy = ({ children }) =>
  <HalfGrid style={{ paddingTop: 0 }}>
    <div id='leftCol'>
      {/*<Image layout='intrinsic' alt='privacy icon' style={{ width: '100%', height: '100%' }} src='/static/img/sign-up/privacy.svg' />*/}
    </div>
    <div id='rightCol'>
      <Privacy />
      {children}
    </div>

  </HalfGrid>
export default AcceptPrivacy
