import { Group, NumberInput } from "@mantine/core";

import {
  ENTITY_TRANSFORM_AXES,
  ENTITY_TRANSFORM_DECIMAL_SCALE,
  ENTITY_TRANSFORM_STEP,
} from "@/constants/entity-constants.ts";
import messages from "@/constants/messages.json";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { EntityTransformAxis, EntityTransformValue } from "@/types/entity.ts";

const AXIS_LABELS: Record<EntityTransformAxis, string> = {
  x: messages.entities.editor.axisX,
  y: messages.entities.editor.axisY,
  z: messages.entities.editor.axisZ,
};

type EntityTransformRowProps = {
  errors: Partial<Record<EntityTransformAxis, string>>;
  groupLabel: string;
  values: Record<EntityTransformAxis, EntityTransformValue>;
  onBlur: (axis: EntityTransformAxis) => void;
  onChange: (axis: EntityTransformAxis, value: EntityTransformValue) => void;
};

export default function EntityTransformRow({
  errors,
  groupLabel,
  values,
  onBlur,
  onChange,
}: EntityTransformRowProps) {
  return (
    <Group grow gap="md" align="flex-start" wrap="wrap">
      {ENTITY_TRANSFORM_AXES.map((axis) => (
        <NumberInput
          key={axis}
          withAsterisk
          label={formatMessage(messages.entities.editor.transformLabel, {
            group: groupLabel,
            axis: AXIS_LABELS[axis],
          })}
          step={ENTITY_TRANSFORM_STEP}
          decimalScale={ENTITY_TRANSFORM_DECIMAL_SCALE}
          value={values[axis]}
          error={errors[axis]}
          onBlur={() => onBlur(axis)}
          onChange={(value) => onChange(axis, value)}
        />
      ))}
    </Group>
  );
}
