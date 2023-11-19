import {
  Box,
  SimpleGrid,
  Stack,
  HStack,
  Collapse,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  Switch,
  RadioGroup,
  Radio,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { FiCircle, FiTriangle, FiSquare } from 'react-icons/fi'
import { useIshiharaStore } from '../store'
import { type IshiharaPlate } from '../../../../dist/ishihara'

type Shape = Parameters<IshiharaPlate['addShape']>[0]
type Deficiency = Parameters<IshiharaPlate['setColors']>[0]

const shapes: Shape[] = ['circle', 'square', 'triangle']
const iconMap = new Map<Shape, React.ReactElement>([
  ['circle', <FiCircle key="circle" />],
  ['square', <FiSquare key="square" />],
  ['triangle', <FiTriangle key="triangle" />],
])

export default function Controls() {
  const store = useIshiharaStore()

  return (
    <Stack spacing={6}>
      <FormControl>
        <FormLabel fontSize="md" fontWeight="semibold">
          Shape
        </FormLabel>
        <SimpleGrid columns={2} spacing={2}>
          {shapes.map((shape) => (
            <Button
              key={shape}
              size="sm"
              colorScheme="blue"
              variant={store.shape === shape ? 'solid' : 'outline'}
              leftIcon={iconMap.get(shape)}
              value={shape}
              onClick={() => store.setShape(shape)}
              textTransform="capitalize"
            >
              {shape}
            </Button>
          ))}
        </SimpleGrid>
      </FormControl>

      <Stack spacing={3}>
        <FormControl>
          <FormLabel fontSize="md" fontWeight="semibold">
            Colors
          </FormLabel>
          <FormHelperText>
            Control the colors used by the Ishihara plate. Selecting protan,
            deutan, or tritan will generate colors that fall along a random
            confusion line for that deficiency
          </FormHelperText>
        </FormControl>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <FormControl>
            <FormLabel fontSize="sm">Palette</FormLabel>
            <Select
              size="sm"
              value={store.colorScheme}
              onChange={(event) =>
                store.setColorScheme(event.currentTarget.value as Deficiency)
              }
            >
              <option value="protan">Protan</option>
              <option value="deutan">Deutan</option>
              <option value="tritan">Tritan</option>
            </Select>
          </FormControl>

          <FormControl flex={0} marginLeft={6}>
            <FormLabel fontSize="sm">Contrast</FormLabel>
            <NumberInput size="sm" min={0} max={100}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <FormControl>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormLabel fontSize="md" fontWeight="semibold" marginBottom={0}>
              Simulate color blindness
            </FormLabel>
            <Switch
              size="sm"
              isChecked={!!store.colorBlindMode}
              onChange={(event) =>
                store.simulateColorBlindness(
                  event.currentTarget.checked ? 'protan' : false
                )
              }
            />
          </Box>
          <FormHelperText>
            Allows you to view the Ishihara plate as a color blind observer
            would
          </FormHelperText>
        </FormControl>
        <Collapse in={!!store.colorBlindMode}>
          <Stack spacing={3}>
            <FormControl>
              <FormLabel fontSize="sm">Deficiency</FormLabel>
              <RadioGroup
                size="sm"
                value={store.colorBlindMode || undefined}
                onChange={(value) =>
                  store.simulateColorBlindness(
                    value as Deficiency,
                    store.severity
                  )
                }
              >
                <HStack spacing={4}>
                  <Radio value="protan">Protan</Radio>
                  <Radio value="deutan">Deutan</Radio>
                  <Radio value="tritan">Tritan</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Severity</FormLabel>
              <Box ml="calc(1ch + 12px)">
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={store.severity}
                  onChange={(value) =>
                    store.simulateColorBlindness(store.colorBlindMode, value)
                  }
                  maxWidth="calc(100% - 1ch - 24px)"
                >
                  <SliderThumb />
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderMark value={0} mt={-3} ml="calc(-1ch - 12px)">
                    0
                  </SliderMark>
                  <SliderMark value={1} mt={-3} ml="calc(12px)">
                    1
                  </SliderMark>
                </Slider>
              </Box>
            </FormControl>
          </Stack>
        </Collapse>
      </Stack>
    </Stack>
  )
}
