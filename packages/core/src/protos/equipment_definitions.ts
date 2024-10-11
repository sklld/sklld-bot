// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.2
//   protoc               v5.28.2
// source: packages/core/src/protos/equipment_definitions.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "blitzkit";

export interface EquipmentDefinitions {
  presets: { [key: string]: EquipmentPreset };
  equipments: { [key: number]: Equipment };
}

export interface EquipmentDefinitions_PresetsEntry {
  key: string;
  value: EquipmentPreset | undefined;
}

export interface EquipmentDefinitions_EquipmentsEntry {
  key: number;
  value: Equipment | undefined;
}

export interface Equipment {
  name: string;
  description: string;
}

export interface EquipmentPreset {
  slots: EquipmentSlot[];
}

export interface EquipmentSlot {
  left: number;
  right: number;
}

function createBaseEquipmentDefinitions(): EquipmentDefinitions {
  return { presets: {}, equipments: {} };
}

export const EquipmentDefinitions: MessageFns<EquipmentDefinitions> = {
  encode(message: EquipmentDefinitions, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    Object.entries(message.presets).forEach(([key, value]) => {
      EquipmentDefinitions_PresetsEntry.encode({ key: key as any, value }, writer.uint32(10).fork()).join();
    });
    Object.entries(message.equipments).forEach(([key, value]) => {
      EquipmentDefinitions_EquipmentsEntry.encode({ key: key as any, value }, writer.uint32(18).fork()).join();
    });
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EquipmentDefinitions {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquipmentDefinitions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          const entry1 = EquipmentDefinitions_PresetsEntry.decode(reader, reader.uint32());
          if (entry1.value !== undefined) {
            message.presets[entry1.key] = entry1.value;
          }
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          const entry2 = EquipmentDefinitions_EquipmentsEntry.decode(reader, reader.uint32());
          if (entry2.value !== undefined) {
            message.equipments[entry2.key] = entry2.value;
          }
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EquipmentDefinitions {
    return {
      presets: isObject(object.presets)
        ? Object.entries(object.presets).reduce<{ [key: string]: EquipmentPreset }>((acc, [key, value]) => {
          acc[key] = EquipmentPreset.fromJSON(value);
          return acc;
        }, {})
        : {},
      equipments: isObject(object.equipments)
        ? Object.entries(object.equipments).reduce<{ [key: number]: Equipment }>((acc, [key, value]) => {
          acc[globalThis.Number(key)] = Equipment.fromJSON(value);
          return acc;
        }, {})
        : {},
    };
  },

  toJSON(message: EquipmentDefinitions): unknown {
    const obj: any = {};
    if (message.presets) {
      const entries = Object.entries(message.presets);
      if (entries.length > 0) {
        obj.presets = {};
        entries.forEach(([k, v]) => {
          obj.presets[k] = EquipmentPreset.toJSON(v);
        });
      }
    }
    if (message.equipments) {
      const entries = Object.entries(message.equipments);
      if (entries.length > 0) {
        obj.equipments = {};
        entries.forEach(([k, v]) => {
          obj.equipments[k] = Equipment.toJSON(v);
        });
      }
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EquipmentDefinitions>, I>>(base?: I): EquipmentDefinitions {
    return EquipmentDefinitions.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<EquipmentDefinitions>, I>>(object: I): EquipmentDefinitions {
    const message = createBaseEquipmentDefinitions();
    message.presets = Object.entries(object.presets ?? {}).reduce<{ [key: string]: EquipmentPreset }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = EquipmentPreset.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    message.equipments = Object.entries(object.equipments ?? {}).reduce<{ [key: number]: Equipment }>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[globalThis.Number(key)] = Equipment.fromPartial(value);
        }
        return acc;
      },
      {},
    );
    return message;
  },
};

function createBaseEquipmentDefinitions_PresetsEntry(): EquipmentDefinitions_PresetsEntry {
  return { key: "", value: createBaseEquipmentPreset() };
}

export const EquipmentDefinitions_PresetsEntry: MessageFns<EquipmentDefinitions_PresetsEntry> = {
  encode(message: EquipmentDefinitions_PresetsEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.key !== undefined) {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== undefined) {
      EquipmentPreset.encode(message.value, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EquipmentDefinitions_PresetsEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquipmentDefinitions_PresetsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.key = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.value = EquipmentPreset.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EquipmentDefinitions_PresetsEntry {
    return {
      key: globalThis.String(assertSet("EquipmentDefinitions_PresetsEntry.key", object.key)),
      value: EquipmentPreset.fromJSON(assertSet("EquipmentDefinitions_PresetsEntry.value", object.value)),
    };
  },

  toJSON(message: EquipmentDefinitions_PresetsEntry): unknown {
    const obj: any = {};
    if (message.key !== undefined) {
      obj.key = message.key;
    }
    if (message.value !== undefined) {
      obj.value = EquipmentPreset.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EquipmentDefinitions_PresetsEntry>, I>>(
    base?: I,
  ): EquipmentDefinitions_PresetsEntry {
    return EquipmentDefinitions_PresetsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<EquipmentDefinitions_PresetsEntry>, I>>(
    object: I,
  ): EquipmentDefinitions_PresetsEntry {
    const message = createBaseEquipmentDefinitions_PresetsEntry();
    message.key = object.key ?? "";
    message.value = (object.value !== undefined && object.value !== null)
      ? EquipmentPreset.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseEquipmentDefinitions_EquipmentsEntry(): EquipmentDefinitions_EquipmentsEntry {
  return { key: 0, value: createBaseEquipment() };
}

export const EquipmentDefinitions_EquipmentsEntry: MessageFns<EquipmentDefinitions_EquipmentsEntry> = {
  encode(message: EquipmentDefinitions_EquipmentsEntry, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.key !== undefined) {
      writer.uint32(8).uint32(message.key);
    }
    if (message.value !== undefined) {
      Equipment.encode(message.value, writer.uint32(18).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EquipmentDefinitions_EquipmentsEntry {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquipmentDefinitions_EquipmentsEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.key = reader.uint32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.value = Equipment.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EquipmentDefinitions_EquipmentsEntry {
    return {
      key: globalThis.Number(assertSet("EquipmentDefinitions_EquipmentsEntry.key", object.key)),
      value: Equipment.fromJSON(assertSet("EquipmentDefinitions_EquipmentsEntry.value", object.value)),
    };
  },

  toJSON(message: EquipmentDefinitions_EquipmentsEntry): unknown {
    const obj: any = {};
    if (message.key !== undefined) {
      obj.key = Math.round(message.key);
    }
    if (message.value !== undefined) {
      obj.value = Equipment.toJSON(message.value);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EquipmentDefinitions_EquipmentsEntry>, I>>(
    base?: I,
  ): EquipmentDefinitions_EquipmentsEntry {
    return EquipmentDefinitions_EquipmentsEntry.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<EquipmentDefinitions_EquipmentsEntry>, I>>(
    object: I,
  ): EquipmentDefinitions_EquipmentsEntry {
    const message = createBaseEquipmentDefinitions_EquipmentsEntry();
    message.key = object.key ?? 0;
    message.value = (object.value !== undefined && object.value !== null)
      ? Equipment.fromPartial(object.value)
      : undefined;
    return message;
  },
};

function createBaseEquipment(): Equipment {
  return { name: "", description: "" };
}

export const Equipment: MessageFns<Equipment> = {
  encode(message: Equipment, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): Equipment {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquipment();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Equipment {
    return {
      name: globalThis.String(assertSet("Equipment.name", object.name)),
      description: globalThis.String(assertSet("Equipment.description", object.description)),
    };
  },

  toJSON(message: Equipment): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.description !== "") {
      obj.description = message.description;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Equipment>, I>>(base?: I): Equipment {
    return Equipment.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Equipment>, I>>(object: I): Equipment {
    const message = createBaseEquipment();
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    return message;
  },
};

function createBaseEquipmentPreset(): EquipmentPreset {
  return { slots: [] };
}

export const EquipmentPreset: MessageFns<EquipmentPreset> = {
  encode(message: EquipmentPreset, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    for (const v of message.slots) {
      EquipmentSlot.encode(v!, writer.uint32(10).fork()).join();
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EquipmentPreset {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquipmentPreset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }

          message.slots.push(EquipmentSlot.decode(reader, reader.uint32()));
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EquipmentPreset {
    return {
      slots: globalThis.Array.isArray(object?.slots) ? object.slots.map((e: any) => EquipmentSlot.fromJSON(e)) : [],
    };
  },

  toJSON(message: EquipmentPreset): unknown {
    const obj: any = {};
    if (message.slots?.length) {
      obj.slots = message.slots.map((e) => EquipmentSlot.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EquipmentPreset>, I>>(base?: I): EquipmentPreset {
    return EquipmentPreset.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<EquipmentPreset>, I>>(object: I): EquipmentPreset {
    const message = createBaseEquipmentPreset();
    message.slots = object.slots?.map((e) => EquipmentSlot.fromPartial(e)) || [];
    return message;
  },
};

function createBaseEquipmentSlot(): EquipmentSlot {
  return { left: 0, right: 0 };
}

export const EquipmentSlot: MessageFns<EquipmentSlot> = {
  encode(message: EquipmentSlot, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
    if (message.left !== 0) {
      writer.uint32(8).uint32(message.left);
    }
    if (message.right !== 0) {
      writer.uint32(16).uint32(message.right);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): EquipmentSlot {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquipmentSlot();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }

          message.left = reader.uint32();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }

          message.right = reader.uint32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): EquipmentSlot {
    return {
      left: globalThis.Number(assertSet("EquipmentSlot.left", object.left)),
      right: globalThis.Number(assertSet("EquipmentSlot.right", object.right)),
    };
  },

  toJSON(message: EquipmentSlot): unknown {
    const obj: any = {};
    if (message.left !== 0) {
      obj.left = Math.round(message.left);
    }
    if (message.right !== 0) {
      obj.right = Math.round(message.right);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<EquipmentSlot>, I>>(base?: I): EquipmentSlot {
    return EquipmentSlot.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<EquipmentSlot>, I>>(object: I): EquipmentSlot {
    const message = createBaseEquipmentSlot();
    message.left = object.left ?? 0;
    message.right = object.right ?? 0;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string; value: unknown } ? { $case: T["$case"]; value?: DeepPartial<T["value"]> }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null;
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

function assertSet<T>(field: string, value: T | undefined): T {
  if (!isSet(value)) {
    throw new TypeError(`Required field ${field} is not set`);
  }

  return value as T;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}