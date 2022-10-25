import { useRouter } from 'next/router'

export default () => {
  const router = useRouter()
  const goto = (url: string) => () => {
    router.push(url)
      .catch(_ => {
        location.href = url
      })
  }

  return {
    router,
    goto
  }
}
