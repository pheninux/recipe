package main

import (
	"testing"
	"time"
)

func TestHumainDate(t *testing.T) {

	tests := []struct {
		name string
		hd   time.Time
		want string
	}{
		{
			name: "UTC",
			hd:   time.Date(2020, 12, 20, 12, 0, 0, 0, time.UTC),
			want: "12/20/2020 12:00",
		},
		{
			name: "EMPTY",
			hd:   time.Time{},
			want: "",
		},
		{
			name: "CET",
			hd:   time.Date(2020, 12, 20, 12, 0, 0, 0, time.FixedZone("CET", 1*60*60)),
			want: "12/20/2020 11:00",
		},
	}

	for _, tt := range tests {

		t.Run(tt.name, func(t *testing.T) {

			hd := humainDate(tt.hd)
			if hd != tt.want {
				t.Errorf("want %q , get %q", tt.want, hd)
			}
		})
	}
}
