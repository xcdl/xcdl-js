/*
 * This file is part of the XCDL distribution 
 *   (http://xcdl.github.io).
 * Copyright (c) 2015 Liviu Ionescu.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict'

var liquid = {}
module.exports = liquid

// ----------------------------------------------------------------------------

// Append an underscore to C/C++ keywords.
// Useful when creating variable names, types, etc.

liquid.tag_c_keywords = function (v) {

  var c_keywords = [
    'alignas',
    'alignof',
    'and',
    'and_eq',
    'asm',
    'atomic_cancel',
    'atomic_commit',
    'atomic_noexcept',
    'auto',
    'bitand',
    'bitor',
    'bool',
    'break',
    'case',
    'catch',
    'char',
    'char16_t',
    'char32_t',
    'class',
    'compl',
    'concept',
    'const',
    'constexpr',
    'const_cast',
    'continue',
    'decltype',
    'default',
    'delete',
    'do',
    'double',
    'dynamic_cast',
    'else',
    'enum',
    'explicit',
    'export',
    'extern',
    'false',
    'far',
    'float',
    'for',
    'friend',
    'goto',
    'if',
    'import',
    'inline',
    'int',
    'long',
    'module',
    'mutable',
    'namespace',
    'near',
    'new',
    'noexcept',
    'not',
    'not_eq',
    'nullptr',
    'operator',
    'or',
    'or_eq',
    'override',
    'private',
    'protected',
    'public',
    'register',
    'reinterpret_cast',
    'requires',
    'restict',
    'return',
    'short',
    'signed',
    'sizeof',
    'static',
    'static_assert',
    'static_cast',
    'struct',
    'switch',
    'synchronized',
    'template',
    'this',
    'thread_local',
    'throw',
    'transaction_safe',
    'transaction_safe_dynamic',
    'true',
    'try',
    'typedef',
    'typeid',
    'typename',
    'union',
    'unsigned',
    'using',
    'virtual',
    'void',
    'volatile',
    'wchar_t',
    'while',
    'xor',
    'xor_eq',
    '_Alignas',
    '_Alignof',
    '_Atomic',
    '_Bool',
    '_Complex',
    '_Generic',
    '_Imaginary',
    '_Noreturn',
    '_Static_assert',
    '_Thread_local',
  ]

  if (v && c_keywords.indexOf(v) >= 0) {
    return v + '_' // Append an underscore to avoid keywords.
  }
  return v;
}

liquid.tag_to_uint = function (v) {
  if (!v) {
    return v
  }

  if (v.startsWith('0x') || v.startsWith('0X')) {
    return parseInt(v.substr(2), 16)
  } else {
    return parseInt(v)
  }
  return v;
}

liquid.tag_to_hex = function (v) {
  if (!v) {
    return v
  }

  if (v.startsWith('0x') || v.startsWith('0X')) {
    return '0x'+parseInt(v.substr(2), 16).toString(16).toUpperCase()
  } else {
    return '0x'+parseInt(v).toString(16).toUpperCase()
  }
  return v;
}

liquid.tag_rw_bits = function (v) {
  if (!v) {
    return v
  }

  if (v === 'read-write') {
    return 'REGISTER_RW_MODE_READ_WRITE'
  } else if (v === 'read-only') {
    return 'REGISTER_RW_MODE_READ'
  } else if (v === 'write-only') {
   return 'REGISTER_RW_MODE_WRITE' 
  }
  return v;
}
