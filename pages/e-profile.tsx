import Link from "next/link"
import { useState, useEffect } from 'react'

function Profile() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    const searchEndpoint = (query) => `/api/nextSearch?searchString=${query}`

    setLoading(true)
    fetch(searchEndpoint(100))
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>

  return (
    <div>
      {data.map(({ id, title }) => (
      <li  key={id}>
        <Link href="/posts/[id]" as={`/posts/${id}`}>
        <a>{title}</a>
        </Link>
      </li>
      ))}
    </div>
  )
}

export default Profile;
