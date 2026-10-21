import {
  ENTITY_DEFAULT_TRANSFORM,
  ENTITY_TRANSFORM_AXES,
} from '@/constants/entity-constants.ts'
import messages from '@/constants/messages.json'
import { validateEntityForm } from '@/helpers/entity-service-helper.ts'
import type { EntityFormValues, EntityTransformField } from '@/types/entity.ts'

function createValues(overrides: Partial<EntityFormValues> = {}): EntityFormValues {
  return {
    ...ENTITY_DEFAULT_TRANSFORM,
    slug: 'main-entrance',
    mesh: 'mesh-id',
    is_active: true,
    ...overrides,
  }
}

const positionAndRotationFields: EntityTransformField[] = ENTITY_TRANSFORM_AXES.flatMap(
  (axis): EntityTransformField[] => [`pos_${axis}`, `rotation_${axis}`],
)

const scaleFields = ENTITY_TRANSFORM_AXES.map((axis): EntityTransformField => `scale_${axis}`)

describe('validateEntityForm transforms', () => {
  it('accepts the default transform', () => {
    expect(validateEntityForm(createValues())).toEqual({})
  })

  it.each(positionAndRotationFields)('accepts 0 on %s as a number and as a typed string', (field) => {
    expect(validateEntityForm(createValues({ [field]: 0 }))).toEqual({})
    expect(validateEntityForm(createValues({ [field]: '0' }))).toEqual({})
  })

  it.each(scaleFields)('rejects a zero %s as a number and as a typed string', (field) => {
    expect(validateEntityForm(createValues({ [field]: 0 }))).toEqual({
      [field]: messages.entities.transform.scaleZero,
    })
    expect(validateEntityForm(createValues({ [field]: '0' }))).toEqual({
      [field]: messages.entities.transform.scaleZero,
    })
  })

  it.each([-1, 0.5, '-1', '0.5'])('accepts a nonzero scale of %p', (value) => {
    expect(validateEntityForm(createValues({ scale_x: value }))).toEqual({})
  })

  it.each(['pos_x', 'rotation_y', 'scale_z'] as const)('requires a value on %s', (field) => {
    expect(validateEntityForm(createValues({ [field]: '' }))).toEqual({
      [field]: messages.entities.transform.required,
    })
    expect(validateEntityForm(createValues({ [field]: '  ' }))).toEqual({
      [field]: messages.entities.transform.required,
    })
  })

  it.each(['pos_x', 'rotation_y', 'scale_z'] as const)('rejects a non-numeric %s', (field) => {
    expect(validateEntityForm(createValues({ [field]: '-' }))).toEqual({
      [field]: messages.entities.transform.invalid,
    })
  })
})
