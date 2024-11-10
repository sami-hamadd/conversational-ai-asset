"use client";

import { MantineColorsTuple, MantineThemeOverride } from '@mantine/core';

const companyColor: MantineColorsTuple = [
  "#e7fcf9",
  "#dbf2ee",
  "#b9e2dc",
  "#94d1c8",
  "#75c2b7",
  "#61baad",
  "#55b6a7",
  "#43a092",
  "#368f82",
  "#1f7c70"
];
const greyAccent: MantineColorsTuple = [
  "#fff2f5",
  "#ece6e7",
  "#cfcdcd",
  "#b2b2b2",
  "#9a9a9a",
  "#8b8b8b",
  "#848484",
  "#737171",
  "#686465",
  "#5f5457"
]

export const theme: MantineThemeOverride = {
  colors: {
    companyColor,
    greyAccent,
  },
  primaryColor: 'greyAccent',
  fontFamily: 'ui-sans-serif, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, sans-serif, Segoe UI Emoji, Segoe UI Symbol',
  headings: {
    fontFamily: 'ui-sans-serif, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, sans-serif, Segoe UI Emoji, Segoe UI Symbol'
  },
};
