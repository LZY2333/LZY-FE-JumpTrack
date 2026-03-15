import WebMenuEntry from '@/_blocks/Managements/_components/Menus/WebMenuEntry'
import { trackComponentName } from '@/coco-react/analytics'
import { useSignOut } from '@/contexts/AuthContext/hooks/signOut'
import { useSiteSpecificContext } from '@/contexts/SiteSpecificContext'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { useDebounceFn } from 'ahooks'
import React from 'react'

import ProjectDropdown from '../../_layout/Header/ProjectDropdown'
import { useGetAccountMenuList } from '../../app/_hooks/menu'
import { UserAvatar } from '../UserInfo'
import { profileMenuClassName } from './constants'

interface IHeaderActionsProps {
  className?: string
  iconStyle?: string
  isWeb?: boolean
  itemClassName?: string
  locales?: string[] | null
  handleOpenChange?: (open: boolean) => void
}
export default function HeaderActions(props: IHeaderActionsProps) {
  const { className, itemClassName, locales, handleOpenChange } = props
  const { user } = useSiteSpecificContext()

  useLingui()

  const signOut = useSignOut()

  // 回调函数，用于关闭弹窗
  const handleCallback = () => {
    handleOpenChange?.(false)
  }

  const { tabs } = useGetAccountMenuList(
    locales
      ? { locales, callback: handleCallback }
      : { callback: handleCallback },
  )

  const itemCls = cls`
    hover:text-f-primary hover:bg-f-bg-layout text-f-text flex items-center gap-x-2
    space-x-[2px] rounded px-2 py-2.5 text-base font-semibold transition-all hover:cursor-pointer md:py-2 md:text-sm
  `

  const { run: handleClick } = useDebounceFn(
    (e) => {
      const target = e.target as HTMLElement
      const menuItem = target.closest('li')
      if (menuItem && menuItem.dataset.buttonName) {
        tracker.trackEvent(
          {
            name: 'framework_widget_click',
            button_name: menuItem.dataset.buttonName,
          },
          {
            parsing: {
              event: e,
            },
          },
        )
      }
    },
    { wait: 200, leading: true, trailing: false },
  )

  return (
    <div
      id={profileMenuClassName}
      className={tw`overflow-hidden p-4 md:w-[360px] ${className}`}
      data-widget-name={
        trackComponentName.framework_widget.value.user_center.name
      }
    >
      <div className='bg-f-bg-layout flex flex-col gap-0.5 rounded-lg p-2'>
        <div className='flex items-center gap-2 p-2'>
          <UserAvatar className='!size-8' />
          <div className='flex flex-col'>
            <span className='text-f-text text-xs font-semibold leading-4'>
              {user.userName}
            </span>
            <span className='text-f-text-quaternary text-xs font-normal leading-4'>
              {user.userEmail}
            </span>
          </div>
        </div>
      </div>

      <div className='bg-f-bg-layout mt-2 flex flex-col gap-0.5 rounded-lg p-2'>
        <div className='px-2 py-1'>
          <span className='text-f-text-quaternary text-xs font-normal leading-4'>
            <Trans>Workspace</Trans>
          </span>
        </div>
        <ProjectDropdown onSelectedCallback={handleCallback} />
      </div>

      <div className='border-f-border-secondary my-2 border-t' />
      <ul
        className='divide-f-border-secondary flex flex-col divide-y overflow-hidden p-0'
        onClick={handleClick}
      >
        {tabs.map((v) => {
          return (
            <li key={v.title} className='py-2' data-button-name={v.buttonName}>
              {v.url ? (
                <Link
                  href={v.url}
                  className={tw`${itemCls} ${itemClassName} ${v.className}`}
                >
                  <span>{v.title}</span>
                  {v.icon}
                </Link>
              ) : v.render ? (
                <React.Fragment key={v.title}>
                  {v.render(tw`${itemCls} ${itemClassName} ${v.className}`)}
                </React.Fragment>
              ) : null}
            </li>
          )
        })}
        <WebMenuEntry />
        <li
          className={tw`${itemCls} ${itemClassName}`}
          data-button-name={
            trackComponentName.framework_widget.value.user_center.value.logout
              .name
          }
          onClick={async () => {
            try {
              await signOut()
              handleOpenChange?.(false)
            } catch (err) {
              // eslint-disable-next-line no-console
              console.log(err)
            }
          }}
        >
          <span>{t`Logout`}</span>
        </li>
      </ul>
    </div>
  )
}
