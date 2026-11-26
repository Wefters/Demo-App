<template>
  <ModulePage
    icon="MessageSquare"
    title="Native System Dialogs & Toasts"
    desc="@wefterjs/dialog v0.0.1"
    info="Platform-native alerts, confirm modals, single & multi-line text input prompts, and Android Toast / iOS Banner notifications."
  >
    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Native Alert Dialog
      </h3>
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Title</label>
            <input
              v-model="alertForm.title"
              type="text"
              placeholder="Notice"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Button Label</label>
            <input
              v-model="alertForm.buttonText"
              type="text"
              placeholder="OK"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Message</label>
          <textarea
            v-model="alertForm.message"
            rows="2"
            placeholder="Operation completed successfully."
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          ></textarea>
        </div>
        <button
          @click="triggerAlert"
          class="w-full py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Info" :size="16" />
          <span>Show Alert Dialog</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Native Confirmation Modal
      </h3>
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Title</label>
            <input
              v-model="confirmForm.title"
              type="text"
              placeholder="Confirm Action"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-text-secondary">OK Label</label>
              <input
                v-model="confirmForm.okText"
                type="text"
                placeholder="Confirm"
                class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-medium text-text-secondary">Cancel Label</label>
              <input
                v-model="confirmForm.cancelText"
                type="text"
                placeholder="Cancel"
                class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Message</label>
          <textarea
            v-model="confirmForm.message"
            rows="2"
            placeholder="Are you sure you want to proceed with this operation?"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          ></textarea>
        </div>
        <button
          @click="triggerConfirm"
          class="w-full py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="HelpCircle" :size="16" />
          <span>Show Confirm Dialog</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Native Input Prompt
      </h3>
      <div class="flex flex-col gap-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Title</label>
            <input
              v-model="promptForm.title"
              type="text"
              placeholder="User Verification"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Keyboard / Input Type</label>
            <select
              v-model="promptForm.inputType"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="text">text</option>
              <option value="email">email</option>
              <option value="password">password</option>
              <option value="number">number</option>
              <option value="url">url</option>
              <option value="tel">tel</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Placeholder</label>
            <input
              v-model="promptForm.placeholder"
              type="text"
              placeholder="Type value..."
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Default Pre-filled Value</label>
            <input
              v-model="promptForm.defaultValue"
              type="text"
              placeholder="Pre-filled value"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">OK Label</label>
            <input
              v-model="promptForm.okText"
              type="text"
              placeholder="Submit"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Cancel Label</label>
            <input
              v-model="promptForm.cancelText"
              type="text"
              placeholder="Cancel"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Message / Label</label>
          <textarea
            v-model="promptForm.message"
            rows="2"
            placeholder="Please enter your access code:"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          ></textarea>
        </div>

        <button
          @click="triggerPrompt"
          class="w-full py-2.5 bg-accent hover:bg-accent-bright text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="Edit3" :size="16" />
          <span>Show Prompt Dialog</span>
        </button>
      </div>
    </div>

    <div class="p-4 bg-surface border border-border-subtle rounded-2xl flex flex-col gap-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
        Native Toast Notification
      </h3>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Toast Message</label>
          <input
            v-model="toastForm.text"
            type="text"
            placeholder="Item added to favorites!"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Duration</label>
            <select
              v-model="toastForm.durationMode"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="short">Short (~2 seconds)</option>
              <option value="long">Long (~3.5 seconds)</option>
              <option value="custom">Custom (ms)</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-medium text-text-secondary">Screen Position</label>
            <select
              v-model="toastForm.position"
              class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="bottom">Bottom (Default)</option>
              <option value="center">Center</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>

        <div v-if="toastForm.durationMode === 'custom'" class="flex flex-col gap-1">
          <label class="text-xs font-medium text-text-secondary">Custom Duration (ms)</label>
          <input
            v-model.number="toastForm.customDuration"
            type="number"
            placeholder="2500"
            class="px-3 py-2 bg-surface-raised border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </div>

        <button
          @click="triggerToast"
          class="w-full py-2.5 bg-accent-subtle hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icons name="MessageSquare" :size="16" />
          <span>Show Toast Notification</span>
        </button>
      </div>
    </div>

    <ShowcaseConsole :logs="logs" @clear="logs = []" />
  </ModulePage>
</template>

<script setup lang="ts">
/** Demo of `@wefterjs/dialog`: native alerts, confirmations, prompts and toasts with editable content. */

import { ref, reactive } from 'vue'
import { Dialog, type InputType, type ToastPosition } from '@wefterjs/dialog'
import ModulePage from '@/components/common/ModulePage.vue'
import ShowcaseConsole, { type LogItem } from '@/components/showcase/ShowcaseConsole.vue'
import Icons from '@/components/common/Icons.vue'

const logs = ref<LogItem[]>([])

/** Content of the alert dialog. */
const alertForm = reactive({
  title: 'Wefter Alert',
  message: 'This is a platform native alert dialog triggered from JavaScript.',
  buttonText: 'OK',
})

/** Content of the confirmation dialog. */
const confirmForm = reactive({
  title: 'Confirm Operation',
  message: 'Do you want to apply the configuration changes?',
  okText: 'Confirm',
  cancelText: 'Cancel',
})

/** Content of the prompt dialog. */
const promptForm = reactive({
  title: 'Input Required',
  message: 'Enter your verification security code:',
  okText: 'Submit',
  cancelText: 'Cancel',
  placeholder: 'Security Code',
  inputType: 'text' as InputType,
  defaultValue: '',
})

/** Text, duration and position of the toast. */
const toastForm = reactive({
  text: 'Action completed successfully!',
  durationMode: 'short' as 'short' | 'long' | 'custom',
  customDuration: 2500,
  position: 'bottom' as ToastPosition,
})

/** Current time, for log entries. */
function now() {
  return new Date().toLocaleTimeString()
}

/** Shows the alert. */
async function triggerAlert() {
  try {
    const res = await Dialog.alert({
      title: alertForm.title || undefined,
      message: alertForm.message,
      buttonText: alertForm.buttonText || undefined,
    })
    logs.value.unshift({
      method: 'Dialog.alert',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Dialog.alert',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Shows the confirmation and logs the choice. */
async function triggerConfirm() {
  try {
    const res = await Dialog.confirm({
      title: confirmForm.title || undefined,
      message: confirmForm.message,
      okText: confirmForm.okText || undefined,
      cancelText: confirmForm.cancelText || undefined,
    })
    logs.value.unshift({
      method: 'Dialog.confirm',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Dialog.confirm',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Shows the prompt and logs the answer. */
async function triggerPrompt() {
  try {
    const res = await Dialog.prompt({
      title: promptForm.title || undefined,
      message: promptForm.message,
      okText: promptForm.okText || undefined,
      cancelText: promptForm.cancelText || undefined,
      placeholder: promptForm.placeholder || undefined,
      inputType: promptForm.inputType,
      defaultValue: promptForm.defaultValue || undefined,
    })
    logs.value.unshift({
      method: 'Dialog.prompt',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Dialog.prompt',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}

/** Shows the toast. */
async function triggerToast() {
  try {
    const res = await Dialog.toast({
      text: toastForm.text,
      duration:
        toastForm.durationMode === 'custom' ? toastForm.customDuration : toastForm.durationMode,
      position: toastForm.position,
    })
    logs.value.unshift({
      method: 'Dialog.toast',
      status: 'success',
      data: res,
      timestamp: now(),
    })
  } catch (err: any) {
    logs.value.unshift({
      method: 'Dialog.toast',
      status: 'error',
      data: { error: err?.message || String(err) },
      timestamp: now(),
    })
  }
}
</script>
