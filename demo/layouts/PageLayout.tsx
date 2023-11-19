import { useMemo } from 'react'
import {
  Box,
  IconButton,
  Drawer,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Show,
  Hide,
  useDisclosure,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'

interface Props {
  content: React.ReactNode
  sidePanel?: React.ReactNode
  inlineSidePanel?: boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export default function PageLayout({
  content,
  sidePanel,
  inlineSidePanel,
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const panelVisibilityProps = useMemo(() => {
    if (inlineSidePanel) {
      return typeof inlineSidePanel === 'string'
        ? { above: inlineSidePanel }
        : { breakpoint: '(min-width: 0px)' }
    }
    return { breakpoint: '(max-width: 0px)' }
  }, [inlineSidePanel])

  return (
    <Box position="relative" width="100vw" height="100vh">
      <Box display="flex" flexDirection="row" padding={4}>
        {content}
        <Show {...panelVisibilityProps}>
          <Box marginLeft="auto" paddingLeft={4} maxWidth="sm">
            {sidePanel}
          </Box>
        </Show>
      </Box>
      <Hide {...panelVisibilityProps}>
        <IconButton
          aria-label="Open drawer"
          icon={<HamburgerIcon />}
          onClick={onOpen}
          position="absolute"
          top={4}
          right={0}
          borderEndRadius={0}
        />
        <Drawer isOpen={isOpen} onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader>
              <DrawerCloseButton />
            </DrawerHeader>
            <DrawerBody>{sidePanel}</DrawerBody>
          </DrawerContent>
        </Drawer>
      </Hide>
    </Box>
  )
}
