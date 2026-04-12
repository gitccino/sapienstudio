import { DownloadedAvatarState } from '@/lib/sapiens-resource'
import React, { forwardRef } from 'react'
import {
  SAPIENS_CONFIG,
  VEGETR_CONFIG,
  COLLECTIONS_CONFIG,
} from '@/constants/collections'
import Image, { StaticImageData } from 'next/image'
import { DIST_DOMAIN, VERSION } from '@/constants'

type SapiensDisplayV2Props = {
  avatarState: DownloadedAvatarState
} & React.ComponentProps<'div'>

export default forwardRef<HTMLDivElement, SapiensDisplayV2Props>(
  function SapiensDisplayV2(
    { avatarState, className, ...props },
    ref: React.ForwardedRef<HTMLDivElement>,
  ) {
    const collectionConfig = COLLECTIONS_CONFIG.find(
      (c) => c.id === avatarState.collectionId,
    )

    if (!collectionConfig) return null
    // console.log(avatarState, collectionConfig.traits)

    return (
      <div ref={ref} className="relative isolate aspect-square w-full">
        {/* {collectionConfig.baseLayer && (
          <collectionConfig.baseLayer.component
            color={avatarState.colors.body}
            className="avatar-locked-position"
          />
        )} */}
        {collectionConfig.baseLayer && (
          <>
            {(() => {
              if (collectionConfig.baseLayer.type === 'component') {
                const BaseComponent = collectionConfig.baseLayer
                  .component as any
                return (
                  <BaseComponent
                    // color={
                    //   collectionConfig.baseLayer.colorCategory
                    //     ? (selectedColors[
                    //         collectionConfig.baseLayer.colorCategory
                    //       ] as string)
                    //     : undefined
                    // }
                    color={avatarState.colors.body}
                    className="absolute top-1/2 left-1/2 mt-1 h-full w-full -translate-x-1/2 -translate-y-1/2"
                  />
                )
              }
              return (
                <Image
                  src={collectionConfig.baseLayer.component as StaticImageData}
                  alt="body"
                  fill
                  priority
                  className="object-contain"
                />
              )
            })()}
          </>
        )}

        {collectionConfig.traits
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((traitConfig) => {
            const traitName = avatarState.traits[traitConfig.id]
            const TraitComponent = traitConfig.options[traitName]
            const color = avatarState.colors[traitConfig.id]
            if (traitConfig.type === 'component') {
              return (
                <TraitComponent
                  key={traitConfig.id}
                  color={color}
                  className="avatar-locked-position"
                />
              )
            }

            if (traitConfig.type === 'image') {
              return (
                <Image
                  key={traitConfig.id}
                  alt={traitName as string}
                  src={`https://${DIST_DOMAIN}/${collectionConfig.id}/${traitConfig.path}/${traitName}${traitConfig.extension}${VERSION}`}
                  width={500}
                  height={500}
                  className="avatar-locked-position"
                ></Image>
              )
            }
          })}
      </div>
    )
  },
)
