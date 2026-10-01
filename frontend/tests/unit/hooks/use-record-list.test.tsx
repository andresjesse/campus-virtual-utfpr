import { notifications } from '@mantine/notifications'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'

import messages from '@/constants/messages.json'
import { DialogContext } from '@/contexts/dialog-context.ts'
import { formatMessage } from '@/helpers/message-helper.ts'
import { useRecordList } from '@/hooks/use-record-list.ts'

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}))

type Record = { id: string; name: string }

const records: Record[] = [
  { id: 'a', name: 'predio_a' },
  { id: 'b', name: 'predio_b' },
]

const showMock = jest.mocked(notifications.show)

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function setup({
  listRecords = jest.fn().mockResolvedValue(records),
  deleteRecord = jest.fn().mockResolvedValue(undefined),
  confirm = jest.fn().mockResolvedValue(true),
}: {
  listRecords?: jest.Mock
  deleteRecord?: jest.Mock
  confirm?: jest.Mock
} = {}) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <DialogContext value={{ confirm }}>{children}</DialogContext>
  )

  const rendered = renderHook(
    () =>
      useRecordList<Record>({
        texts: messages.mesh.list,
        listRecords,
        deleteRecord,
        getSearchableText: (record) => record.name,
        getName: (record) => record.name || messages.mesh.list.noIdentifier,
      }),
    { wrapper },
  )

  return { ...rendered, listRecords, deleteRecord, confirm }
}

describe('useRecordList', () => {
  it('loads the records on mount', async () => {
    const { result } = setup()

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.records).toEqual(records)
    expect(result.current.filtered).toEqual(records)
    expect(result.current.error).toBe('')
  })

  it('exposes a load failure and recovers through reload', async () => {
    const listRecords = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(records)
    const { result } = setup({ listRecords })

    await waitFor(() => expect(result.current.error).not.toBe(''))
    expect(result.current.records).toEqual([])

    await act(async () => {
      await result.current.reload()
    })

    expect(result.current.error).toBe('')
    expect(result.current.records).toEqual(records)
  })

  it('filters the records by the query', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.setQuery('predio_b'))

    expect(result.current.filtered).toEqual([records[1]])
    expect(result.current.records).toEqual(records)
  })

  it('asks for confirmation with the record name and deletes nothing when refused', async () => {
    const confirm = jest.fn().mockResolvedValue(false)
    const { result, deleteRecord } = setup({ confirm })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.requestDelete(records[0])
    })

    expect(confirm).toHaveBeenCalledWith({
      title: messages.mesh.list.deleteConfirmTitle,
      firstMessage: formatMessage(messages.mesh.list.deleteConfirmFirst, 'predio_a'),
      secondMessage: messages.mesh.list.deleteConfirmSecond,
    })
    expect(deleteRecord).not.toHaveBeenCalled()
    expect(result.current.records).toEqual(records)
  })

  it('refetches the list and notifies once the deletion succeeds', async () => {
    const listRecords = jest
      .fn()
      .mockResolvedValueOnce(records)
      .mockResolvedValue([records[1]])
    const { result, deleteRecord } = setup({ listRecords })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.requestDelete(records[0])
    })

    expect(deleteRecord).toHaveBeenCalledWith('a')
    expect(listRecords).toHaveBeenCalledTimes(2)
    expect(result.current.records).toEqual([records[1]])
    expect(showMock).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 'green',
        title: messages.mesh.list.deletedTitle,
        message: messages.mesh.list.deletedMessage,
      }),
    )
  })

  it('drops records the server cascaded away with the deleted one', async () => {
    const parent = { id: 'parent', name: 'parent_item' }
    const child = { id: 'child', name: 'child_item' }
    const listRecords = jest
      .fn()
      .mockResolvedValueOnce([parent, child])
      .mockResolvedValue([])
    const { result } = setup({ listRecords })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.requestDelete(parent)
    })

    expect(result.current.records).toEqual([])
  })

  it('keeps the record and notifies the error when the deletion fails', async () => {
    const deleteRecord = jest.fn().mockRejectedValue(new Error('nope'))
    const { result } = setup({ deleteRecord })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.requestDelete(records[0])
    })

    expect(result.current.records).toEqual(records)
    expect(showMock).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 'red',
        title: messages.common.deleteErrorTitle,
      }),
    )
  })

  it('flags the record being deleted while the request is in flight', async () => {
    const pending = deferred<void>()
    const deleteRecord = jest.fn().mockReturnValue(pending.promise)
    const { result } = setup({ deleteRecord })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let deletion!: Promise<void>
    await act(async () => {
      deletion = result.current.requestDelete(records[0])
    })

    expect(result.current.deletingId).toBe('a')

    await act(async () => {
      pending.resolve()
      await deletion
    })

    expect(result.current.deletingId).toBeNull()
  })
})
